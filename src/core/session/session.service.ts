import { Injectable } from '@nestjs/common';
import { BaileysSocketService } from './baileys-socket/baileys-socket.service';
import { SessionStateService } from './session-state/session-state.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly baileysSocketService: BaileysSocketService,
    private readonly sessionStateService: SessionStateService,
  ) { }

  // Cria a sessão, criando o estado e iniciando o socket
  async createSession(sessionId: string) {
    try {
      const sessionExists = await this.sessionStateService.getSessionState(sessionId);
      if (sessionExists) { throw new Error('Session already exists') }
      await this.baileysSocketService.create(sessionId);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create session.');
    }
  }

  // Faz o logout da sessão, desconectando e limpando o estado
  async logoutSession(sessionId: string) {
    try {
      const sessionState = await this.sessionStateService.getSessionState(sessionId);
      if (!sessionState) { throw new Error(`Session ${sessionId} does not exist.`) }
      await this.baileysSocketService.logout(sessionId);
    } catch (error) {
      throw new Error('Failed to logout session.');
    }
  }

  // Faz o restart da sessão
  async restartSession(sessionId: string) {
    try {
      const sessionState = await this.sessionStateService.getSessionState(sessionId);
      if (!sessionState) { throw new Error(`Session ${sessionId} does not exist.`) }
      await this.sessionStateService.restartSession(sessionId);
      await this.baileysSocketService.restart(sessionId);
    } catch (error) {
      throw new Error('Failed to restart session.');
    }
  }

  observeSessionState(sessionId: string) {
    return this.sessionStateService.getSessionStateSubject(sessionId);
  }
}
