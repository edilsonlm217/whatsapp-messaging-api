import { Contact } from '@whiskeysockets/baileys';

export type SessionConnectionStatus = 'connecting' | 'open' | 'close' | 'logged-out';

export class SessionState {
  sessionId: string;
  status: SessionConnectionStatus;
  qrCode: string | null;
  creds: {
    contact?: Contact;
    phonePlatform?: string;
  } | null;
  lastUpdated: Date;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.status = 'connecting'; // inicial
    this.qrCode = null;
    this.creds = null;
    this.lastUpdated = new Date();
  }
}
