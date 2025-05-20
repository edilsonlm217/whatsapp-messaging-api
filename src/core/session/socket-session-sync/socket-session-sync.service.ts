import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SessionStateService } from '../session-state/session-state.service';
import { BaileysSocketService } from '../baileys-socket/baileys-socket.service';
import { InconsistentStateEmitterService } from './services/inconsistent-state-emitter.service';
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
    private readonly baileysSocketService: BaileysSocketService,
    private readonly inconsistentStateEmitter: InconsistentStateEmitterService
  ) { }

  @OnEvent('QrCodeGenerated')
  handleQRCodeGenerated(event: StructuredEvent<QrCodeGeneratedPayload>) {
    try {
      this.sessionStateService.updateQRCode(event.sessionId, event.payload.qr);
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('QrCodeTimeout')
  handleQrCodeTimeout(event: StructuredEvent<ConnectionClosedPayload>) {
    try {
      this.sessionStateService.updateStatus(event.sessionId, 'qr-timeout');
      this.sessionStateService.clearSessionState(event.sessionId);
      this.baileysSocketService.disposeSocket(event.sessionId);
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('ConnectionClosed', { async: true })
  async handleConnectionClosed(event: StructuredEvent<ConnectionClosedPayload>) {
    try {
      this.sessionStateService.updateStatus(event.sessionId, 'close');
      this.sessionStateService.restartSession(event.sessionId);
      await this.baileysSocketService.restart(event.sessionId);
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('ConnectionLoggedOut', { async: true })
  async handleLoggedOut(event: StructuredEvent<ConnectionLoggedOutPayload>) {
    try {
      this.sessionStateService.updateStatus(event.sessionId, 'logged-out');
      await this.baileysSocketService.deleteAuthState(event.sessionId);
      this.baileysSocketService.disposeSocket(event.sessionId);
      this.sessionStateService.clearSessionState(event.sessionId);
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('ConnectionOpened')
  handleConnectionOpened(event: StructuredEvent<ConnectionOpenedPayload>) {
    try {
      this.sessionStateService.updateStatus(event.sessionId, 'open');
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('ConnectionStarted')
  handleConnectionStarted(event: StructuredEvent<ConnectionOpenedPayload>) {
    try {
      this.sessionStateService.updateStatus(event.sessionId, 'starting');
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }

  @OnEvent('CredsUpdated', { async: true })
  async handleCredsUpdated(event: StructuredEvent<CredsUpdatedPayload>) {
    try {
      this.sessionStateService.updateCreds(
        event.sessionId,
        event.payload.me,
        event.payload.platform ?? ''
      );
      await this.baileysSocketService.saveCreds(event.sessionId, event.payload);
    } catch (error) {
      this.inconsistentStateEmitter.emitInconsistentState(
        event,
        SocketSessionSyncService.name,
        error
      );
    }
  }
}
