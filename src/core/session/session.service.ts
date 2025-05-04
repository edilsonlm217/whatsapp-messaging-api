import { Injectable } from '@nestjs/common';
import { BaileysSocketService } from './baileys-socket/baileys-socket.service';
import { SessionStateService } from './session-state/session-state.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly baileysSocketService: BaileysSocketService,
    private readonly sessionStateService: SessionStateService,
  ) { }

  async createSession(sessionId: string) {
    const socketExists = await this.baileysSocketService.hasSocket(sessionId);
    const sessionExists = this.sessionStateService.getSessionState(sessionId);

    if (socketExists && sessionExists) { throw new Error('Session already exists') }
    if (socketExists && !sessionExists) { throw new Error('Active socket without session state') }
    if (!socketExists && sessionExists) { throw new Error('Session state exists without active socket') }

    await this.baileysSocketService.createSocket(sessionId);
  }

  // Faz o logout da sessão, desconectando e limpando o estado
  async logoutSession(sessionId: string) {
    const socketExists = await this.baileysSocketService.hasSocket(sessionId);
    const sessionExists = this.sessionStateService.getSessionState(sessionId);

    if (!socketExists && !sessionExists) { throw new Error('Session does not exist') }
    if (!socketExists && sessionExists) { throw new Error('Session exists but socket is missing') }
    if (socketExists && !sessionExists) { throw new Error('Socket exists but session state is missing') }

    await this.baileysSocketService.logout(sessionId);
  }

  // Faz o restart da sessão
  async restartSession(sessionId: string) {
    const socketExists = await this.baileysSocketService.hasSocket(sessionId);
    const sessionExists = this.sessionStateService.getSessionState(sessionId);

    if (!socketExists && !sessionExists) { throw new Error('Session does not exist') }
    if (!socketExists && sessionExists) { throw new Error('Session exists but socket is missing') }
    if (socketExists && !sessionExists) { throw new Error('Socket exists but session state is missing') }

    this.sessionStateService.restartSession(sessionId);
    await this.baileysSocketService.restart(sessionId);
  }

  async observeSessionState(sessionId: string) {
    const socketExists = await this.baileysSocketService.hasSocket(sessionId);
    const sessionExists = this.sessionStateService.getSessionState(sessionId);

    if (!socketExists && !sessionExists) { throw new Error('Session does not exist') }
    if (!socketExists && sessionExists) { throw new Error('Session exists but socket is missing') }
    if (socketExists && !sessionExists) { throw new Error('Socket exists but session state is missing') }

    const subject = this.sessionStateService.getSessionStateSubject(sessionId);
    if (!subject) { throw new Error('Session state stream not found') }
    return subject;
  }
}
