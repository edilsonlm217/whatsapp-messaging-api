import { proto } from '@whiskeysockets/baileys';

export interface MessageStatusPayload {
  id: string | undefined;
  message: string | null | undefined;
  ackStatus: proto.WebMessageInfo.Status;
}
