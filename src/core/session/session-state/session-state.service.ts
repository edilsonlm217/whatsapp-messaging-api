import { Injectable } from '@nestjs/common';
import { SessionState, SessionConnectionStatus } from './session-state.model';
import { BehaviorSubject } from 'rxjs';
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
      state.qrCode = qrCode;
      state.lastUpdated = new Date();
    });
  }

  updateStatus(sessionId: string, status: SessionConnectionStatus) {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = status;
      if (status === 'open') {
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
      state.status = 'connecting';
      state.qrCode = null;
      state.creds = null;
      state.lastUpdated = new Date();
    });
  }

  getSessionStateSubject(sessionId: string) {
    return this.stateManagerService.getSubject(sessionId);
  }
}
