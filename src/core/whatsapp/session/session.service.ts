import { Injectable } from '@nestjs/common';
import { AuthStateService } from './auth-state/auth-state.service';
import { WhatsAppSession } from './whatsapp-session';
import { SessionStateService } from './session-state/session-state.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly authStateService: AuthStateService,
    private readonly sessionStateService: SessionStateService,
  ) { }

  /**
   * Cria e armazena uma nova sessão do WhatsApp.
   */
  async createSession(sessionId: string) {
    const sessionExists = this.sessionStateService.find(sessionId);
    if (sessionExists) { throw new Error('Sessão já existe') }
    const session = new WhatsAppSession(sessionId, this.authStateService);
    this.sessionStateService.save(sessionId, session);
    await session.iniciarSessao()
    return session;
  }

  async deleteSession(sessionId: string) {
    return this.sessionStateService.delete(sessionId);
  }

  /**
   * Encerra uma sessão específica.
   */
  async logout(sessionId: string): Promise<void> {
    const session = this.sessionStateService.find(sessionId);
    if (!session) { throw new Error('Sessão não existe') }
    await session.logout();
    console.log(`Sessão ${sessionId} removida.`);
  }

  /**
   * Obtém uma instância da sessão específica.
   */
  getSession(sessionId: string) {
    return this.sessionStateService.find(sessionId);
  }

  /**
   * Obtém uma sessão existente e escuta seus eventos.
   * Se a sessão não existir, retorna `undefined`.
   */
  async getSessionEventStream(sessionId: string) {
    const session = this.getSession(sessionId);
    if (!session) { throw new Error('Sessão não existe') }
    return session.sessionEvents$;
  }
}
