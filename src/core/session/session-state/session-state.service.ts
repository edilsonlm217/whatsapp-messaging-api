import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionState } from './session-state.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SessionStateService {
  private sessionStateMap = new Map<string, SessionState>();
  private sessionStateSubjectMap = new Map<string, BehaviorSubject<SessionState>>();

  // Recupera o estado da sessão
  async getSessionState(sessionId: string): Promise<SessionState | undefined> {
    return this.sessionStateMap.get(sessionId);
  }

  // Cria o estado da sessão
  async createSessionState(sessionId: string): Promise<SessionState> {
    const sessionState = new SessionState(sessionId);
    this.sessionStateMap.set(sessionId, sessionState);

    const subject = new BehaviorSubject<SessionState>(sessionState);
    this.sessionStateSubjectMap.set(sessionId, subject);

    return sessionState;
  }

  // Centraliza o set e a emissão do evento
  private async set(sessionId: string, sessionState: SessionState): Promise<void> {
    this.sessionStateMap.set(sessionId, sessionState);
    this.sessionStateSubjectMap.get(sessionId)?.next(sessionState);
  }

  // Atualiza o QR code no estado da sessão
  async updateQRCode(sessionId: string, qrCode: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.qrCode = qrCode;
    sessionState.lastUpdated = new Date();

    await this.set(sessionId, sessionState);
  }

  // Fecha a sessão
  async closeSession(sessionId: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.isConnected = false;
    sessionState.isLoggedIn = false;
    sessionState.lastUpdated = new Date();

    await this.set(sessionId, sessionState);
  }

  // Realiza o logout
  async logoutSession(sessionId: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.isLoggedIn = false;
    sessionState.isConnected = false;
    sessionState.lastUpdated = new Date();

    await this.set(sessionId, sessionState);
  }

  // Atualiza o estado de conexão aberta
  async updateConnectionOpened(sessionId: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.isConnected = true;
    sessionState.lastUpdated = new Date();
    sessionState.qrCode = null;

    await this.set(sessionId, sessionState);
  }

  // Atualiza as credenciais
  async updateCreds(sessionId: string, phone: string, phonePlatform: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.creds = { phone, phonePlatform };
    sessionState.lastUpdated = new Date();

    await this.set(sessionId, sessionState);
  }

  // Reinicia o estado da sessão
  async restartSession(sessionId: string): Promise<void> {
    let sessionState = await this.getSessionState(sessionId);
    if (!sessionState) {
      sessionState = await this.createSessionState(sessionId);
    }
    sessionState.isConnected = false;
    sessionState.qrCode = null;
    sessionState.creds = null;
    sessionState.isLoggedIn = false;
    sessionState.lastUpdated = new Date();

    await this.set(sessionId, sessionState);
  }

  // Método para obter o BehaviorSubject da sessão
  getSessionStateSubject(sessionId: string): BehaviorSubject<SessionState> {
    const sessionSubject = this.sessionStateSubjectMap.get(sessionId);
    if (!sessionSubject) {
      throw new NotFoundException(`Session with ID ${sessionId} does not exist`);
    }
    return sessionSubject;
  }
}
