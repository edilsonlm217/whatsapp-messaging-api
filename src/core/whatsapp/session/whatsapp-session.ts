import { WASocket, makeWASocket, DisconnectReason, ConnectionState, BaileysEventMap, AuthenticationState, AuthenticationCreds } from '@whiskeysockets/baileys';
import { BehaviorSubject, Subject } from 'rxjs';
import { Boom } from '@hapi/boom';
import { SessionEvent } from 'src/common/interfaces/session-event.interface';
import { SessionData } from 'src/common/interfaces/session.data.interface';
import { DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';
import { DeviceInfo } from 'src/common/interfaces/device-info.interface';
import { UnexpectedDisconnectionEvent } from 'src/common/interfaces/unexpected-disconnection-event.interface';
import { LogoutDisconnectionEvent } from 'src/common/interfaces/logout-disconnection-event.interface';
import { CredsUpdateEvent } from 'src/common/interfaces/creds-update-event.interface';
import { EventPayloadHelper } from './event-payload.helper';

export class WhatsAppSession {
  private socket: WASocket | null = null;
  private deviceInfo: DeviceInfo = {};

  private sessionEvents = new BehaviorSubject<SessionEvent | null>(null);
  private unexpectedDisconnection = new Subject<UnexpectedDisconnectionEvent>();
  private logoutDisconnection = new Subject<LogoutDisconnectionEvent>();
  private credsUpdate = new Subject<CredsUpdateEvent>();

  // Adicionamos esta lista para controlar os eventos aos quais estamos assinando
  private subscribedEvents: (keyof BaileysEventMap)[] = [];

  constructor(private sessionId: string) { }

  get sessionEvents$() { return this.sessionEvents.asObservable() }
  get unexpectedDisconnection$() { return this.unexpectedDisconnection.asObservable() }
  get logoutDisconnection$() { return this.logoutDisconnection.asObservable() }
  get credsUpdate$() { return this.credsUpdate.asObservable() }

  public iniciarSessao(state: AuthenticationState) {
    this.setupSocket(state);
  }

  public reconectarSessao(state: AuthenticationState) {
    const payload = EventPayloadHelper.createReconnectPayload(this.deviceInfo);
    this.emitEvent('connection_update', payload);
    this.setupSocket(state);
  }

  public async logout() {
    if (this.socket) { await this.socket.logout() }
  }

  private setupSocket(state: AuthenticationState) {
    this.socket = makeWASocket({ printQRInTerminal: true, auth: state, qrTimeout: 20000 });

    this.socket.ev.on('creds.update', async () => { await this.handleCredsUpdate(state) });
    this.socket.ev.on('connection.update', async (update) => { await this.handleConnectionUpdate(update) });

    // Aqui, inscrevemos os eventos que que assinamos
    this.subscribedEvents.push('connection.update', 'creds.update');
  }

  private async handleCredsUpdate(state: AuthenticationState) {
    const authState = this.socket?.authState;
    this.setDeviceInfo('phone', authState?.creds?.me?.id);
    this.setDeviceInfo('phonePlatform', authState?.creds?.platform);
    this.emitCredsUpdate(this.sessionId, state.creds)
  }

  private async handleConnectionUpdate(update: Partial<ConnectionState>) {
    if (update.qr) this.onQRCodeReceived(update);
    if (update.connection === 'open') await this.onSessionOpened();
    if (update.connection === 'close') await this.onSessionClosed(update);
  }

  private onQRCodeReceived(update: Partial<ConnectionState>) {
    const payload = EventPayloadHelper.createQRCodePayload(update.qr!);
    this.emitEvent('connection_update', payload);
  }

  private async onSessionOpened() {
    const payload = EventPayloadHelper.createConnectedPayload(this.deviceInfo);
    this.emitEvent('connection_update', payload);
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      const payload = EventPayloadHelper.createUnexpectedDisconnectionPayload(this.deviceInfo);
      this.emitEvent('connection_update', payload);
      this.emitUnexpectedDisconnection(this.sessionId);
    } else {
      const payload = EventPayloadHelper.createLogoutDisconnectionPayload(this.deviceInfo);
      this.emitEvent('connection_update', payload);
      this.emitLogoutDisconnection(this.sessionId);

      // Chama desconectar para garantir que a sessão seja completamente encerrada
      await this.limparSessao();
    }
  }

  private async limparSessao() {
    // Completa o subject de eventos
    Promise.resolve().then(async () => {
      this.sessionEvents.complete(); // Completa o subject

      // Remove os listeners registrados
      this.subscribedEvents.forEach((event) => {
        this.socket?.ev.removeAllListeners(event);  // Remove listener específico
      });

      this.socket = null;
    });
  }

  private emitEvent(type: string, sessionData: SessionData) {
    this.sessionEvents.next({ type, data: sessionData });
  }

  // Método para adicionar ou atualizar informações do dispositivo
  private setDeviceInfo(key: string, value: any) {
    this.deviceInfo[key] = value;
  }

  // Emissão separada por tipo
  private emitUnexpectedDisconnection(sessionId: string) {
    this.unexpectedDisconnection.next({
      sessionId,
      reason: DisconnectionReasonEnum.UNEXPECTED,
      timestamp: new Date().toISOString(),
    });
  }

  private emitLogoutDisconnection(sessionId: string) {
    this.logoutDisconnection.next({
      sessionId,
      reason: DisconnectionReasonEnum.LOGOUT,
      timestamp: new Date().toISOString(),
    });
  }

  private emitCredsUpdate(sessionId: string, creds: AuthenticationCreds) {
    this.credsUpdate.next({
      sessionId,
      creds,
      timestamp: new Date().toISOString(),
    });
  }
}
