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

  async iniciarSessao() {
    await this.setupSocket();
  }

  async reconectarSessao() {
    this.emitEvent('connection_update', {
      session: {
        phone: this.metaInfo.phone,
        phonePlatform: this.metaInfo.phonePlatform,
        connection: {
          status: "reconnecting"
        }
      }
    });
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

      this.baileysEvents.next({ type: 'creds.update', data: authState });
    });

    this.socket.ev.on('connection.update', async (update) => {
      this.setMetaInfo('connectionState', update);
      this.baileysEvents.next({ type: 'connection.update', data: update });

      if (update.qr) this.onQRCodeReceived(update);
      if (update.connection === 'open') await this.onSessionOpened();
      if (update.connection === 'close') await this.onSessionClosed(update);
    });

    // Aqui, inscrevemos os eventos que que assinamos
    this.subscribedEvents.push('connection.update', 'creds.update');
  }

  // Método para adicionar ou atualizar meta informação
  setMetaInfo(key: string, value: any) {
    this.metaInfo[key] = value;
  }

  // Método para acessar meta informação
  getMetaInfo(key: string) {
    return this.metaInfo[key];
  }

  private onQRCodeReceived(update: Partial<ConnectionState>) {
    this.emitEvent('connection_update', {
      session: {
        connection: {
          status: "qr_code"
        },
        qr: update.qr
      }
    });
  }

  private async onSessionOpened() {
    this.emitEvent('connection_update', {
      session: {
        phone: this.metaInfo.phone,
        phonePlatform: this.metaInfo.phonePlatform,
        connection: {
          status: "connected"
        }
      }
    });
  }

  private async onSessionClosed(update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      this.emitEvent('connection_update', {
        session: {
          phone: this.metaInfo.phone,
          phonePlatform: this.metaInfo.phonePlatform,
          connection: {
            status: "disconnected",
            reason: "unexpected disconnection"
          }
        }
      });
      await this.reconectarSessao();
    } else {
      // Emite o evento 'logged_out' aqui, já que é a função responsável por desconectar
      this.emitEvent('connection_update', {
        session: {
          phone: this.metaInfo.phone,
          phonePlatform: this.metaInfo.phonePlatform,
          connection: {
            status: "disconnected",
            reason: "logout"
          }
        }
      });

      // Chama desconectar para garantir que a sessão seja completamente encerrada
      await this.limparSessao();
    }
  }

  async desconectar() {
    if (this.socket) { await this.socket.logout() }
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

  private emitEvent(type: string, data?: any) {
    this.sessionEvents.next({ type, data });
  }
}
