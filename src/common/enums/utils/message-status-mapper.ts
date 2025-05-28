import { MessageStatus } from 'src/common/enums/message-status.enum';
import { proto } from '@whiskeysockets/baileys';

export class MessageStatusMapper {

  /**
   * Mapeia status numérico do Baileys para enum interno do sistema
   */
  static toInternalStatus(status: proto.WebMessageInfo.Status): MessageStatus {
    switch (status) {
      case 0: return MessageStatus.Error;
      case 1: return MessageStatus.Pending;
      case 2: return MessageStatus.ServerAck;
      case 3: return MessageStatus.DeliveryAck;
      case 4: return MessageStatus.Read;
      case 5: return MessageStatus.Played;
      default: return MessageStatus.Error;
    }
  }
}
