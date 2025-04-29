export class SessionState {
  sessionId: string;
  isConnected: boolean = false;
  qrCode: string | null = null;
  isLoggedIn: boolean = false;
  creds: { phone: string; phonePlatform: string } | null = null;
  lastUpdated: Date;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.lastUpdated = new Date();
  }
}
