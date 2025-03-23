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

    session.sessionEvents$.subscribe(({ type, data }) => {
      this.globalEvents.next({ sessionId, type, data });
    });

    await session.iniciarSessao();

    return session.sessionEvents$;
  }

  /**
   * Obtém o fluxo de eventos globais de todas as sessões.
   */
  get events$() {
    return this.globalEvents.asObservable();
  }
}
