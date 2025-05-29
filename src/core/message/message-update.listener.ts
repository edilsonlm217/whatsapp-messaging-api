import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { MessageService } from './message.service';
import { WAMessageUpdate } from '@whiskeysockets/baileys';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';
import { MessageStatusPayload } from 'src/common/message-status-payload.interface';

@Injectable()
export class MessageUpdateListener {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventEmitterService: EventEmitterService,
  ) { }

  @OnEvent('MessageUpdate', { async: true })
  async handleupdate(event: StructuredEvent<WAMessageUpdate>) {
    const msgUpdate = event.payload;
    if (!msgUpdate.key.id || !msgUpdate.update.status) { return }

    await this.messageService.updateMessageStatus(
      msgUpdate.key.id,
      msgUpdate.update.status
    );

    this.eventEmitterService.emitEvent<MessageStatusPayload>(
      event.sessionId,
      'MessageUpdatePersisted',
      'message.update.persistence',
      MessageUpdateListener.name,
      {
        id: msgUpdate.key.id,
        message: undefined,
        ackStatus: msgUpdate.update.status,
      }
    );
  }
}
