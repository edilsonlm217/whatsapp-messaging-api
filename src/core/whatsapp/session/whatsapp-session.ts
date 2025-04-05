import { WASocket, makeWASocket, DisconnectReason, ConnectionState, BaileysEventMap, AuthenticationState } from '@whiskeysockets/baileys';
import { BehaviorSubject } from 'rxjs';
import { Boom } from '@hapi/boom';
import { AuthStateService } from './auth-state/auth-state.service';
import { SessionEvent } from 'src/common/interfaces/session-event.interface';
import { SessionData } from 'src/common/interfaces/session.data.interface';
import { ConnectionStatusEnum, DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';
import { DeviceInfo } from 'src/common/interfaces/device-info.interface';

export class WhatsAppSession {
  private socket: WASocket | null = null;
  private deviceInfo: DeviceInfo = {};
  private sessionEvents = new BehaviorSubject<SessionEvent | null>(null);

  // Adicionamos esta lista para controlar os eventos aos quais estamos assinando
  private subscribedEvents: (keyof BaileysEventMap)[] = [];

  constructor(private sessionId: string, private authService: AuthStateService) { }

  get sessionEvents$() {
    return this.sessionEvents.asObservable();
  }

  public async iniciarSessao() {
    await this.setupSocket();
  }

  public async reconectarSessao() {
    this.emitEvent('connection_update', {
      session: {
        phone: this.deviceInfo.phone,
        phonePlatform: this.deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.RECONNECTING
        }
      },
      timestamp: new Date().toISOString()
    });
    await this.setupSocket();
  }

  public async logout() {
    if (this.socket) { await this.socket.logout() }
  }

  private async setupSocket() {
    const state = await this.authService.getAuthState(this.sessionId);

    this.socket = makeWASocket({ printQRInTerminal: true, auth: state, qrTimeout: 20000 });

    this.socket.ev.on('creds.update', async () => { await this.handleCredsUpdate(state) });
    this.socket.ev.on('connection.update', async (update) => { await this.handleConnectionUpdate(update) });

    // Aqui, inscrevemos os eventos que que assinamos
    this.subscribedEvents.push('connection.update', 'creds.update');
  }

  private async handleCredsUpdate(state: AuthenticationState) {
    await this.authService.saveCreds(this.sessionId, state.creds);
    const authState = this.socket?.authState;
    this.setDeviceInfo('phone', authState?.creds?.me?.id);
    this.setDeviceInfo('phonePlatform', authState?.creds?.platform);
  }

  private async handleConnectionUpdate(update: Partial<ConnectionState>) {
    if (update.qr) this.onQRCodeReceived(update);
    if (update.connection === 'open') await this.onSessionOpened();
    if (update.connection === 'close') await this.onSessionClosed(update);
  }

  private onQRCodeReceived(update: Partial<ConnectionState>) {
    this.emitEvent('connection_update', {
      session: {
        connection: {
          status: ConnectionStatusEnum.QR_CODE
        },
        qr: update.qr
      },
      timestamp: new Date().toISOString()
    });
  }

  private async onSessionOpened() {
    this.emitEvent('connection_update', {
      session: {
        phone: this.deviceInfo.phone,
        phonePlatform: this.deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.CONNECTED
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      this.emitEvent('connection_update', {
        session: {
          phone: this.deviceInfo.phone,
          phonePlatform: this.deviceInfo.phonePlatform,
          connection: {
            status: ConnectionStatusEnum.DISCONNECTED,
            reason: DisconnectionReasonEnum.UNEXPECTED
          }
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Emite o evento 'logged_out' aqui, já que é a função responsável por desconectar
      this.emitEvent('connection_update', {
        session: {
          phone: this.deviceInfo.phone,
          phonePlatform: this.deviceInfo.phonePlatform,
          connection: {
            status: ConnectionStatusEnum.DISCONNECTED,
            reason: DisconnectionReasonEnum.LOGOUT
          }
        },
        timestamp: new Date().toISOString()
      });

      // Chama desconectar para garantir que a sessão seja completamente encerrada
      await this.limparSessao();
    }
  }

  private async limparSessao() {
    // Completa o subject de eventos
    Promise.resolve().then(async () => {
      this.sessionEvents.complete(); // Completa o subject
      // Deleta as credenciais associadas à sessão
      await this.authService.deleteAuthState(this.sessionId);

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
}
