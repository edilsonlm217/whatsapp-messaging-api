import { Injectable } from '@nestjs/common';
import { SessionManager } from './session-manager/session.manager.service';

@Injectable()
export class WhatsAppService {
  constructor(private readonly sessionManager: SessionManager) { }

  /**
   * Obtém ou cria uma nova sessão do WhatsApp.
   */
  async createSession(sessionId: string) {
    return this.sessionManager.createSession(sessionId)
  }

  /**
   * Encerra uma sessão específica através do SessionManager.
   */
  async logout(sessionId: string) {
    return this.sessionManager.logout(sessionId);
  }

  /**
   * Obtém uma sessão existente e escuta seus eventos.
   * Se a sessão não existir, retorna `undefined`.
   */
  async getSessionEventStream(sessionId: string) {
    return this.sessionManager.getSessionEventStream(sessionId);
  }
}
