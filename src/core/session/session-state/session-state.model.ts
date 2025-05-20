import { Contact } from '@whiskeysockets/baileys';

export type SessionConnectionStatus = 'starting' | 'awaiting-qr-code-reading' | 'qr-timeout' | 'close' | 'restarting' | 'open' | 'logged-out';

export interface SessionCreds {
  contact?: Contact;
  phonePlatform?: string;
}
export class SessionState {
  sessionId: string;
  status: SessionConnectionStatus;
  qrCode: string | null;
  creds: SessionCreds | null;
  lastUpdated: Date;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.status = 'starting'
    this.qrCode = null;
    this.creds = null;
    this.lastUpdated = new Date();
  }
}
