import { WASocket, makeWASocket, DisconnectReason, ConnectionState, BaileysEventMap } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import { Boom } from '@hapi/boom';
import { AuthStateService } from './auth-state/auth-state.service';

export class WhatsAppSession {
  private socket: WASocket | null = null;
  private sessionEvents = new Subject<{ type: string; data?: any }>();
  private baileysEvents = new Subject<{ type: string; data?: any }>();
  // Adicionamos esta lista para controlar os eventos aos quais estamos assinando
  private subscribedEvents: (keyof BaileysEventMap)[] = [];

  // Armazena as meta informações
  private metaInfo: { [key: string]: any } = {};

  constructor(private sessionId: string, private authService: AuthStateService) { }

  get sessionEvents$() {
    return this.sessionEvents.asObservable();
  }

  get baileysEvents$() {
    return this.baileysEvents.asObservable();
  }

  // Método para adicionar ou atualizar meta informação
  setMetaInfo(key: string, value: any) {
    this.metaInfo[key] = value;
  }

  // Método para acessar meta informação
  getMetaInfo(key: string) {
    return this.metaInfo[key];
  }

  async iniciarSessao() {
    this.emitEvent('starting');
    await this.setupSocket();
  }

  async reconectarSessao() {
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

      // Armazena as informações nas meta informações
      const authState = this.socket?.authState;
      this.setMetaInfo('phone', authState?.creds?.me?.id);
      this.setMetaInfo('phonePlatform', authState?.creds?.platform);

      this.baileysEvents.next({ type: 'creds.update', data: this.metaInfo });
    });

    this.socket.ev.on('connection.update', async (update) => {
      this.setMetaInfo('connectionState', update);
      this.baileysEvents.next({ type: 'connection.update', data: this.metaInfo });

      if (update.qr) this.onQRCodeReceived(update.qr);
      if (update.connection === 'open') await this.onSessionOpened();
      if (update.connection === 'close') await this.onSessionClosed(update);
    });

    // Aqui, inscrevemos os eventos que que assinamos
    this.subscribedEvents.push('connection.update', 'creds.update');
  }

  private onQRCodeReceived(qr: string) {
    this.emitEvent('qr_code', qr);
  }

  private async onSessionOpened() {
    this.emitEvent('connected', this.metaInfo);
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      this.emitEvent('unexpected_disconnection');
      await this.reconectarSessao();
    } else {
      // Chama desconectar para garantir que a sessão seja completamente encerrada
      await this.desconectar();
    }
  }

  async desconectar() {
    if (this.socket) {

      // Verifica se o WebSocket não está fechado
      if (!this.socket.ws.isClosed) {
        await this.socket.logout();
      }

      this.socket = null;

      // Emite o evento 'logged_out' aqui, já que é a função responsável por desconectar
      this.emitEvent('logged_out');

      // Removemos os listeners registrados
      this.subscribedEvents.forEach((event) => {
        this.socket?.ev.removeAllListeners(event);  // Remove listener específico
      });

      Promise.resolve().then(() => {
        this.sessionEvents.complete(); // Completa o subject
      });
    }
  }

  private emitEvent(type: string, data?: any) {
    this.sessionEvents.next({ type, data });
  }
}
