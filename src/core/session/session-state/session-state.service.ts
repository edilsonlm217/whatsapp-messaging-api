import { Injectable } from '@nestjs/common';
import { SessionConnectionStatus } from './session-state.model';
import { StateManagerService } from './state-manager/state-manager.service';
import { Contact } from '@whiskeysockets/baileys';

@Injectable()
export class SessionStateService {
  constructor(private readonly stateManagerService: StateManagerService) { }

  getSessionState(sessionId: string) {
    return this.stateManagerService.get(sessionId);
  }

  updateQRCode(sessionId: string, qrCode: string) {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = 'awaiting-qr-code-reading'
      state.qrCode = qrCode;
      state.lastUpdated = new Date();
    });
  }

  updateStatus(sessionId: string, status: SessionConnectionStatus) {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = status;
      if (status === 'open' || status === 'qr-timeout') {
        state.qrCode = null; // QR não é mais necessário após conexão aberta
      }
      state.lastUpdated = new Date();
    });
  }

  updateCreds(sessionId: string, contact: Contact | undefined, phonePlatform: string) {
    this.stateManagerService.update(sessionId, (state) => {
      state.creds = { contact, phonePlatform };
      state.lastUpdated = new Date();
    });
  }

  restartSession(sessionId: string) {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = 'restarting';
      state.qrCode = null;
      state.creds = null;
      state.lastUpdated = new Date();
    });
  }

  /** Remove completamente o estado e subject da sessão */
  clearSessionState(sessionId: string) {
    this.stateManagerService.remove(sessionId);
  }

  getSessionStateSubject(sessionId: string) {
    return this.stateManagerService.getSubject(sessionId);
  }
}
