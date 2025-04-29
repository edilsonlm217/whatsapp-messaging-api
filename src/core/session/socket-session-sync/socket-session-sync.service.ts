import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticationCreds } from '@whiskeysockets/baileys';
import { SessionStateService } from '../session-state/session-state.service';
import { BaileysSocketService } from '../baileys-socket/baileys-socket.service';

@Injectable()
export class SocketSessionSyncService {
  constructor(
    private readonly sessionStateService: SessionStateService,
    private readonly baileysSocketService: BaileysSocketService
  ) { }

  // Reage ao evento socket.qrcode.generated
  @OnEvent('socket.qrcode.generated', { async: true })
  async handleQRCodeGenerated(payload: { sessionId: string; qrCode: string }) {
    await this.sessionStateService.updateQRCode(payload.sessionId, payload.qrCode);
  }

  // Reage ao evento socket.connection.closed
  @OnEvent('socket.connection.closed', { async: true })
  async handleConnectionClosed(payload: { sessionId: string }) {
    await this.sessionStateService.closeSession(payload.sessionId);
    // Adicionr a uma fila para trabalhar a reconexão
    await this.sessionStateService.restartSession(payload.sessionId);
    await this.baileysSocketService.restart(payload.sessionId);
  }

  // Reage ao evento socket.connection.logged-out
  @OnEvent('socket.connection.logged-out', { async: true })
  async handleLoggedOut(payload: { sessionId: string }) {
    await this.sessionStateService.logoutSession(payload.sessionId);
    await this.baileysSocketService.deleteAuthState(payload.sessionId);
    this.baileysSocketService.disposeSocket(payload.sessionId);
  }

  // Reage ao evento socket.connection.opened
  @OnEvent('socket.connection.opened', { async: true })
  async handleConnectionOpened(payload: { sessionId: string }) {
    await this.sessionStateService.updateConnectionOpened(payload.sessionId);
  }

  // Reage ao evento socket.creds.updated
  @OnEvent('socket.creds.updated', { async: true })
  async handleCredsUpdated(payload: { sessionId: string; phone: string; phonePlatform: string, creds: AuthenticationCreds }) {
    await this.sessionStateService.updateCreds(payload.sessionId, payload.phone, payload.phonePlatform);
    this.baileysSocketService.saveCreds(payload.sessionId, payload.creds);
  }
}
