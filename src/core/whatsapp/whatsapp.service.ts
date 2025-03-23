import { Injectable } from '@nestjs/common';
import { AuthStateService } from './auth-state/auth-state.service';
import { WhatsAppSession } from './whatsapp-session';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private globalEvents = new Subject<{ sessionId: string; type: string; data?: any }>();

  constructor(private readonly authStateService: AuthStateService) { }

  /**
   * Obtém ou cria uma nova sessão do WhatsApp.
   */
  async startSession(sessionId: string) {
    if (this.isSessionActive(sessionId)) {
      console.log(`Sessão ${sessionId} já está em execução.`);
      return this.sessions.get(sessionId)!.sessionEvents$; // Retorna o Observable diretamente
    }

    console.log(`Iniciando nova sessão ${sessionId}...`);
    const session = this.createSession(sessionId);

    await session.iniciarSessao();

    return session.sessionEvents$; // Retorna o Observable dos eventos da sessão
  }

  /**
 * Verifica se a sessão já está ativa.
 */
  private isSessionActive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Cria e armazena uma nova sessão do WhatsApp.
   */
  private createSession(sessionId: string): WhatsAppSession {
    const session = new WhatsAppSession(sessionId, this.authStateService);
    this.sessions.set(sessionId, session);

    this.subscribeToSessionEvents(sessionId, session);

    return session;
  }

  /**
   * Assina eventos da sessão e gerencia o fluxo global de eventos.
   */
  private subscribeToSessionEvents(sessionId: string, session: WhatsAppSession) {
    session.sessionEvents$.subscribe(({ type, data }) => {
      if (type === 'logged_out') {
        this.sessions.delete(sessionId);
        console.log(`Sessão ${sessionId} removida após logout.`);
      }

      this.globalEvents.next({ sessionId, type, data });
    });
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

  /**
   * Obtém o fluxo de eventos globais de todas as sessões.
   */
  get events$() {
    return this.globalEvents.asObservable();
  }

  /**
   * Obtém uma instância da sessão específica.
   */
  getSession(sessionId: string): WhatsAppSession | undefined {
    return this.sessions.get(sessionId);
  }
}
