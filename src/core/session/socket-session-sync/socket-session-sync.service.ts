import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionStateService } from '../session-state/session-state.service';
import { BaileysSocketService } from '../baileys-socket/baileys-socket.service';
import { StructuredEvent } from 'src/common/structured-event.interface';
import {
  QrCodeGeneratedPayload,
  ConnectionClosedPayload,
  ConnectionLoggedOutPayload,
  ConnectionOpenedPayload,
  CredsUpdatedPayload,
} from 'src/common/session-events.interface';

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
    await this.sessionStateService.updateStatus(event.sessionId, 'close');
    await this.sessionStateService.restartSession(event.sessionId);
    await this.baileysSocketService.restart(event.sessionId);
  }

  @OnEvent('ConnectionLoggedOut', { async: true })
  async handleLoggedOut(event: StructuredEvent<ConnectionLoggedOutPayload>) {
    await this.sessionStateService.updateStatus(event.sessionId, 'logged-out');
    await this.baileysSocketService.deleteAuthState(event.sessionId);
    this.baileysSocketService.disposeSocket(event.sessionId);
  }

  @OnEvent('ConnectionOpened', { async: true })
  async handleConnectionOpened(event: StructuredEvent<ConnectionOpenedPayload>) {
    await this.sessionStateService.updateStatus(event.sessionId, 'open');
  }

  @OnEvent('ConnectionStarted', { async: true })
  async handleConnectionStarted(event: StructuredEvent<ConnectionOpenedPayload>) {
    await this.sessionStateService.updateStatus(event.sessionId, 'connecting');
  }

  @OnEvent('CredsUpdated', { async: true })
  async handleCredsUpdated(event: StructuredEvent<CredsUpdatedPayload>) {
    await this.sessionStateService.updateCreds(
      event.sessionId,
      event.payload.me,
      event.payload.platform ?? ''
    );
    this.baileysSocketService.saveCreds(event.sessionId, event.payload);
  }
}
