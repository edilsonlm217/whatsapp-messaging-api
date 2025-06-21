import { Injectable } from '@nestjs/common';
import { BaileysSocketService } from '../session/baileys-socket/baileys-socket.service';
import { SessionStateService } from '../session/session-state/session-state.service';
import { MessageRepository } from '../message/message.repository';
import { proto } from '@whiskeysockets/baileys';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';
import { MessageStatusPayload } from 'src/common/message-status-payload.interface';

@Injectable()
export class MessageService {
  constructor(
    private readonly baileysSocketService: BaileysSocketService,
    private readonly sessionStateService: SessionStateService,
    private readonly messageRepository: MessageRepository,
    private readonly eventEmitterService: EventEmitterService,
  ) { }

  /**
   * Envia uma mensagem e persiste ela no banco de dados.
   * @param sessionId ID da sessão do usuário
   * @param to Destinatário da mensagem
   * @param message Conteúdo da mensagem
   * @returns A mensagem enviada
   */
  async sendMessage(sessionId: string, to: string, message: string) {
    const socketExists = await this.baileysSocketService.hasSocket(sessionId);
    const sessionExists = this.sessionStateService.getSessionState(sessionId);

    if (!socketExists && !sessionExists) { throw new Error('Session does not exist'); }
    if (!socketExists && sessionExists) { throw new Error('Session exists but socket is missing'); }
    if (socketExists && !sessionExists) { throw new Error('Socket exists but session state is missing'); }

    // Envia a mensagem via Baileys
    const sentMessage = await this.baileysSocketService.sendMessage(sessionId, to, message);

    if (!sentMessage) {
      throw new Error('Failed to send message');
    }

    if (!sentMessage.key.id || !sentMessage.status) {
      throw new Error('The sent message did not return required params');
    }

    // Persiste a mensagem no banco de dados
    await this.messageRepository.create({
      sessionId: sessionId,
      messageId: sentMessage.key.id,
      to,
      content: message,
      sentAt: Date.now(),
      status: sentMessage.status,
    });

    this.eventEmitterService.emitEvent<MessageStatusPayload>(
      sessionId,
      'MessageSent',
      'socket-messages',
      MessageService.name,
      {
        id: sentMessage.key.id,
        messageText: sentMessage.message?.extendedTextMessage?.text,
        ackStatus: sentMessage.status,
      }
    );

    return sentMessage;
  }

  /**
   * Atualiza o status de uma mensagem existente.
   * @param messageId ID único da mensagem
   * @param status Novo status da mensagem
   */
  async updateMessageStatus(messageId: string, status: proto.WebMessageInfo.Status) {
    return this.messageRepository.updateMessageStatus(messageId, status);
  }

  async getMessagesByRange(sessionId: string, range: string) {
    const startDate = this.translateRangeToDate(range);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    return this.messageRepository.findMessagesBySentAt(sessionId, startTimestamp);
  }

  private translateRangeToDate(range: string): Date {
    const now = new Date();
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 1000 * 60 * 60);
      case '24h':
        return new Date(now.getTime() - 1000 * 60 * 60 * 24);
      case '7d':
        return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
      case '30d':
        return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
      default:
        return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
    }
  }
}
