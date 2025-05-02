import { Injectable } from '@nestjs/common';
import { SessionState, SessionConnectionStatus } from './session-state.model';
import { BehaviorSubject } from 'rxjs';
import { StateManagerService } from './state-manager/state-manager.service';
import { Contact } from '@whiskeysockets/baileys';

@Injectable()
export class SessionStateService {
  constructor(private readonly stateManagerService: StateManagerService) { }

  async getSessionState(sessionId: string): Promise<SessionState | undefined> {
    return this.stateManagerService.get(sessionId);
  }

  async updateQRCode(sessionId: string, qrCode: string): Promise<void> {
    this.stateManagerService.update(sessionId, (state) => {
      state.qrCode = qrCode;
      state.lastUpdated = new Date();
    });
  }

  async updateStatus(sessionId: string, status: SessionConnectionStatus): Promise<void> {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = status;
      if (status === 'open') {
        state.qrCode = null; // QR não é mais necessário após conexão aberta
      }
      state.lastUpdated = new Date();
    });
  }

  async updateCreds(
    sessionId: string,
    contact: Contact | undefined,
    phonePlatform: string
  ): Promise<void> {
    this.stateManagerService.update(sessionId, (state) => {
      state.creds = { contact, phonePlatform };
      state.lastUpdated = new Date();
    });
  }

  async restartSession(sessionId: string): Promise<void> {
    this.stateManagerService.update(sessionId, (state) => {
      state.status = 'connecting';
      state.qrCode = null;
      state.creds = null;
      state.lastUpdated = new Date();
    });
  }

  getSessionStateSubject(sessionId: string): BehaviorSubject<SessionState> {
    try {
      return this.stateManagerService.getSubject(sessionId);
    } catch {
      throw new Error(`Session with ID ${sessionId} does not exist`);
    }
  }
}
