import { AuthenticationCreds, ConnectionState } from '@whiskeysockets/baileys';

export interface BaileysEventDto {
  type: string;
  sessionId: string;
  aggregateId: string;
  payload: Partial<ConnectionState | AuthenticationCreds>;
}
