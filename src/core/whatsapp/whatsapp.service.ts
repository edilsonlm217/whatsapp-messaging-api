import { Injectable } from '@nestjs/common';
import { SessionManager } from './session-manager/session.manager.service';

@Injectable()
export class WhatsAppService {

  constructor(
    private readonly sessionManager: SessionManager,
  ) { }

  /**
   * Obtém ou cria uma nova sessão do WhatsApp.
   */
  async listenToSessionEvents(sessionId: string) {
    if (this.sessionManager.isSessionActive(sessionId)) {
      const session = this.sessionManager.getSession(sessionId);
      return session;
    }

    const session = this.sessionManager.createSession(sessionId);
    await session.iniciarSessao();
    return session;
  }

  /**
   * Encerra uma sessão específica através do SessionManager.
   */
  async stopSession(sessionId: string) {
    await this.sessionManager.stopSession(sessionId); // Chama o stopSession do SessionManager
  }
}
