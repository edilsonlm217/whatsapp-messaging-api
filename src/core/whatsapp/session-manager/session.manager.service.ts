import { Injectable } from '@nestjs/common';
import { WhatsAppSession } from './whatsapp-session';
import { AuthStateService } from './auth-state/auth-state.service';

@Injectable()
export class SessionManager {
  private sessions: Map<string, WhatsAppSession> = new Map();

  constructor(private readonly authStateService: AuthStateService) { }

  /**
   * Cria e armazena uma nova sessão do WhatsApp.
   */
  createSession(sessionId: string): WhatsAppSession {
    const session = new WhatsAppSession(sessionId, this.authStateService);
    this.sessions.set(sessionId, session);

    const subscription = session.sessionEvents$.subscribe(({ type }) => {
      if (type === 'logged_out') {
        this.sessions.delete(sessionId);
        subscription.unsubscribe(); // Remove a assinatura para evitar vazamento de memória
      }
    });

    return session;
  }

  /**
   * Obtém uma instância da sessão específica.
   */
  getSession(sessionId: string): WhatsAppSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Verifica se a sessão já está ativa.
   */
  isSessionActive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Encerra uma sessão específica.
   */
  async stopSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      await session.desconectar();
      this.sessions.delete(sessionId);
      console.log(`Sessão ${sessionId} removida.`);
    } else {
      console.log(`Sessão ${sessionId} não encontrada.`);
    }
  }
}
