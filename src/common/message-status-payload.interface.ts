import { proto } from '@whiskeysockets/baileys';

export interface MessageStatusPayload {
  id: string | undefined;
  messageText: string | null | undefined;
  ackStatus: proto.WebMessageInfo.Status;
}
