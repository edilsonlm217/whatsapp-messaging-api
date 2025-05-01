import { Injectable } from '@nestjs/common';
import { SessionState } from './session-state.model';
import { BehaviorSubject } from 'rxjs';
import { StateManagerService } from './state-manager/state-manager.service';

@Injectable()
export class SessionStateService {
  constructor(private readonly stateManagerService: StateManagerService) { }

  async getSessionState(sessionId: string): Promise<SessionState | undefined> {
    return this.stateManagerService.get(sessionId);
  }

  async updateQRCode(sessionId: string, qrCode: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.qrCode = qrCode;
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.isConnected = false;
      state.isLoggedIn = false;
    });
  }

  async logoutSession(sessionId: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.isConnected = false;
      state.isLoggedIn = false;
    });
  }

  async updateConnectionOpened(sessionId: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.isConnected = true;
      state.qrCode = null;
    });
  }

  async updateCreds(sessionId: string, phone: string, phonePlatform: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.creds = { phone, phonePlatform };
    });
  }

  async restartSession(sessionId: string): Promise<void> {
    this.stateManagerService.update(sessionId, state => {
      state.isConnected = false;
      state.isLoggedIn = false;
      state.qrCode = null;
      state.creds = null;
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
