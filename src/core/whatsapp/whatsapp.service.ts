import { Injectable } from '@nestjs/common';
import { SessionManager } from './session-manager/session.manager.service';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private globalEvents = new Subject<{ sessionId: string; type: string; data?: any }>();

  constructor(
    private readonly sessionManager: SessionManager,
  ) { }

  /**
   * Obtém ou cria uma nova sessão do WhatsApp.
   */
  async startSession(sessionId: string) {
    if (this.sessionManager.isSessionActive(sessionId)) {
      console.log(`Sessão ${sessionId} já está em execução.`);
      return;
    }

    const session = this.sessionManager.createSession(sessionId);

    const subscription = session.sessionEvents$.subscribe(({ type, data }) => {
      this.globalEvents.next({ sessionId, type, data });
      // Remove a assinatura para evitar vazamento de memória
      if (type === 'logged_out') { subscription.unsubscribe() }
    });

    await session.iniciarSessao();

    return session;
  }

  /**
   * Encerra uma sessão específica através do SessionManager.
   */
  async stopSession(sessionId: string) {
    await this.sessionManager.stopSession(sessionId); // Chama o stopSession do SessionManager
  }

  /**
   * Obtém uma sessão existente, se disponível.
   */
  getSession(sessionId: string) {
    const session = this.sessionManager.getSession(sessionId);

    if (!session) {
      console.log(`Sessão ${sessionId} não encontrada.`);
    }

    return session;
  }

  /**
   * Obtém o fluxo de eventos globais de todas as sessões.
   */
  get events$() {
    return this.globalEvents.asObservable();
  }
}
