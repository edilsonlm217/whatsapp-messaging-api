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
    if (this.sessions.has(sessionId)) {
      console.log(`Sessão ${sessionId} já está em execução.`);
      return;
    }

    console.log(`Iniciando sessão ${sessionId}...`);
    const session = new WhatsAppSession(sessionId, this.authStateService);
    this.sessions.set(sessionId, session);

    // Assina os eventos da sessão e repassa para o fluxo global
    session.sessionEvents$.subscribe(({ type, data }) => {
      this.globalEvents.next({ sessionId, type, data });

      // Se o evento for "logged_out", remove a sessão do Map
      if (type === 'logged_out') {
        this.sessions.delete(sessionId);
        console.log(`Sessão ${sessionId} removida após logout.`);
      }
    });

    await session.iniciarSessao();
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
