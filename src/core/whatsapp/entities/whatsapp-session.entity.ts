import { WASocket, makeWASocket, DisconnectReason, ConnectionState } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import { Boom } from '@hapi/boom';
import { AuthStateService } from '../submodules/auth-state/auth-state.service';

export class WhatsAppSession {
  private socket: WASocket | null = null;
  private sessionOpened = false;
  private isReconnecting = false;

  private sessionEvents = new Subject<{ type: string; data?: any }>();

  constructor(private sessionId: string, private authService: AuthStateService) { }

  get sessionEvents$() {
    return this.sessionEvents.asObservable();
  }

  async iniciarSessao() {
    this.emitEvent('starting');
    this.sessionOpened = false;
    this.isReconnecting = false;

    await this.setupSocket();
  }

  async reconectarSessao() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    this.emitEvent('reconnecting');
    await this.setupSocket();
  }

  private async setupSocket() {
    const state = await this.authService.getAuthState(this.sessionId);
    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      qrTimeout: 20000,
    });

    this.socket.ev.on('creds.update', async () => {
      await this.authService.saveCreds(this.sessionId, state.creds);
    });

    this.socket.ev.on('connection.update', async (update) => {
      if (update.qr) this.onQRCodeReceived(update.qr);
      if (update.connection === 'open') this.onSessionOpened();
      if (update.connection === 'close') await this.onSessionClosed(update);
    });
  }

  private onQRCodeReceived(qr: string) {
    this.emitEvent('qr_code', qr);
  }

  private onSessionOpened() {
    this.sessionOpened = true;
    this.isReconnecting = false;
    this.emitEvent('connected');
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      this.emitEvent('unexpected_disconnection');
      await this.reconectarSessao();
    } else {
      this.emitEvent('logged_out');
      // Remove credenciais e chaves
      await this.authService.deleteAuthState(this.sessionId);
    }
  }

  async desconectar() {
    if (this.socket) {
      await this.socket.logout();
      this.emitEvent('logged_out');
    }
  }

  private emitEvent(type: string, data?: any) {
    this.sessionEvents.next({ type, data });
  }
}
