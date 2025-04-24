import { AuthenticationCreds, ConnectionState } from '@whiskeysockets/baileys';

export interface BaileysRawEvent {
  type: string;
  sessionId: string;
  aggregateId: string;
  payload: Partial<ConnectionState | AuthenticationCreds>;
}
