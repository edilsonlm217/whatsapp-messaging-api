import { WASocket, makeWASocket, DisconnectReason, ConnectionState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { MultiFileAuthStateService } from './multi-file-auth-state.service';
import { Subject } from 'rxjs';
import { Logger } from '@nestjs/common';

export class WhatsAppSession {
  private socket: WASocket | null = null;
  private sessionOpened = false;
  private isReconnecting = false;

  private sessionEvents = new Subject<{ type: string; data?: any }>();

  constructor(private sessionId: string, private authService: MultiFileAuthStateService) { }

  get sessionEvents$() {
    return this.sessionEvents.asObservable();
  }

  async iniciarSessao() {
    this.emitEvent('starting');
    this.sessionOpened = false;
    this.isReconnecting = false;

    const { state, saveCreds } = await this.authService.getAuthState(this.sessionId);
    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      qrTimeout: 20000,
    });

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('connection.update', async (update) => await this.handleConnectionUpdate(update));
  }

  private async handleConnectionUpdate(update: Partial<ConnectionState>) {
    if (update.qr) this.onQRCodeReceived(update.qr);
    if (update.connection === 'open') this.onSessionOpened();
    if (update.connection === 'close') await this.onSessionClosed(update);
  }

  private onQRCodeReceived(qr: string) {
    Logger.log(`QR Code atualizado para sessão ${this.sessionId}`);
    this.emitEvent('qr_code', qr);
  }

  private onSessionOpened() {
    Logger.log(`Sessão ${this.sessionId} conectada com sucesso!`);
    this.sessionOpened = true;
    this.isReconnecting = false;
    this.emitEvent('connected');
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    Logger.debug((update.lastDisconnect?.error as Boom)?.output);
    const restartRequired =
      (update.lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      Logger.log(`Sessão ${this.sessionId} caiu inesperadamente.`);
      this.emitEvent('unexpected_disconnection');
      await this.reconectarSessao();
    } else {
      Logger.log(`Sessão ${this.sessionId} foi desconectada.`);
      this.emitEvent('logged_out');
      // Remove credenciais e chaves
      await this.authService.deleteAuthState(this.sessionId);
    }
  }

  async reconectarSessao() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    this.emitEvent('reconnecting');

    const { state, saveCreds } = await this.authService.getAuthState(this.sessionId);
    this.socket = makeWASocket({
      printQRInTerminal: false,
      auth: state,
    });

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('connection.update', async (update) => await this.handleConnectionUpdate(update));
  }

  async desconectar() {
    if (this.socket) {
      await this.socket.logout();
      Logger.log(`Sessão ${this.sessionId} desconectada pelo usuário.`);
      this.emitEvent('logged_out');
    }
  }

  private emitEvent(type: string, data?: any) {
    this.sessionEvents.next({ type, data });
  }
}
