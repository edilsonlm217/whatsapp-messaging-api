import { Injectable } from '@nestjs/common';
import { SessionService } from './session/session.service';

@Injectable()
export class WhatsAppService {
  constructor(private readonly sessionService: SessionService) { }

  /**
   * Obtém ou cria uma nova sessão do WhatsApp.
   */
  async createSession(sessionId: string) {
    return this.sessionService.createSession(sessionId)
  }

  /**
   * Encerra uma sessão específica através do SessionManager.
   */
  async logoutSession(sessionId: string) {
    return this.sessionService.logoutSession(sessionId);
  }

  /**
   * Obtém uma sessão existente e escuta seus eventos.
   * Se a sessão não existir, retorna `undefined`.
   */
  async getSessionEventStream(sessionId: string) {
    return this.sessionService.getSessionEventStream(sessionId);
  }
}
