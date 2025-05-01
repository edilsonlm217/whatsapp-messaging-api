import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionStateService } from '../session-state/session-state.service';
import { BaileysSocketService } from '../baileys-socket/baileys-socket.service';
import {
  QrCodeGeneratedPayload,
  ConnectionClosedPayload,
  ConnectionLoggedOutPayload,
  ConnectionOpenedPayload,
  CredsUpdatedPayload,
} from 'src/common/session-events.interface';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { AuthenticationCreds } from '@whiskeysockets/baileys';

@Injectable()
export class SocketSessionSyncService {
  constructor(
    private readonly sessionStateService: SessionStateService,
    private readonly baileysSocketService: BaileysSocketService
  ) { }

  @OnEvent('QrCodeGenerated', { async: true })
  async handleQRCodeGenerated(event: StructuredEvent<QrCodeGeneratedPayload>) {
    await this.sessionStateService.updateQRCode(event.sessionId, event.payload.qr);
  }

  @OnEvent('ConnectionClosed', { async: true })
  async handleConnectionClosed(event: StructuredEvent<ConnectionClosedPayload>) {
    await this.sessionStateService.closeSession(event.sessionId);
    await this.sessionStateService.restartSession(event.sessionId);
    await this.baileysSocketService.restart(event.sessionId);
  }

  @OnEvent('ConnectionLoggedOut', { async: true })
  async handleLoggedOut(event: StructuredEvent<ConnectionLoggedOutPayload>) {
    await this.sessionStateService.logoutSession(event.sessionId);
    await this.baileysSocketService.deleteAuthState(event.sessionId);
    this.baileysSocketService.disposeSocket(event.sessionId);
  }

  @OnEvent('ConnectionOpened', { async: true })
  async handleConnectionOpened(event: StructuredEvent<ConnectionOpenedPayload>) {
    await this.sessionStateService.updateConnectionOpened(event.sessionId);
  }

  @OnEvent('CredsUpdated', { async: true })
  async handleCredsUpdated(event: StructuredEvent<AuthenticationCreds>) {
    await this.sessionStateService.updateCreds(
      event.sessionId,
      event.payload.me?.id ?? '',
      event.payload.platform ?? ''
    );
    event.payload
    this.baileysSocketService.saveCreds(event.sessionId, event.payload);
  }
}
