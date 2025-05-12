import { MessageStatus } from 'src/common/enums/message-status.enum';

/**
 * Representa os dados necessários para criar/persistir uma mensagem de texto enviada via WhatsApp.
 */
export class CreateMessageDto {
  /**
   * ID único da mensagem, gerado pelo cliente (Baileys: key.id).
   */
  messageId: string;

  /**
   * JID do destinatário da mensagem (usuário ou grupo).
   */
  to: string;

  /**
   * Conteúdo textual da mensagem.
   */
  content: string;

  /**
   * Timestamp (Unix) indicando quando a mensagem foi enviada.
   */
  sentAt: number;

  /**
   * Status atual da mensagem no ciclo de entrega (ex: pending, delivered, read, etc.).
   */
  status: MessageStatus;
}
