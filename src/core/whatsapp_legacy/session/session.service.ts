import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthStateService } from './auth-state/auth-state.service';
import { WhatsAppSession } from './whatsapp-session';
import { SessionStateService } from './session-state/session-state.service';
import { SessionMonitorService } from './session-monitor/session-monitor.service';
import { AuthenticationCreds } from '@whiskeysockets/baileys';

@Injectable()
export class SessionService implements OnModuleInit {
  constructor(
    private readonly authStateService: AuthStateService,
    private readonly sessionStateService: SessionStateService,
    private readonly sessionMonitorService: SessionMonitorService,
  ) { }

  onModuleInit() {
    this.listenForSessionMonitorEvents();
  }

  /**
   * Cria e armazena uma nova sessão do WhatsApp.
   */
  async createSession(sessionId: string) {
    const sessionExists = this.sessionStateService.find(sessionId);
    if (sessionExists) throw new Error('Sessão já existe');
    const session = new WhatsAppSession(sessionId);
    this.sessionStateService.save(sessionId, session);
    const state = await this.authStateService.getAuthState(sessionId);
    session.iniciarSessao(state);
    return session;
  }

  /**
   * Encerra uma sessão específica.
   */
  async logoutSession(sessionId: string): Promise<void> {
    const session = this.sessionStateService.find(sessionId);
    if (!session) throw new Error('Sessão não existe');
    await session.logout();
    console.log(`Sessão ${sessionId} removida.`);
  }

  /**
   * Obtém uma sessão existente e escuta seus eventos.
   * Se a sessão não existir, retorna `undefined`.
   */
  async getSessionEventStream(sessionId: string) {
    const session = this.sessionStateService.find(sessionId);
    if (!session) throw new Error('Sessão não existe');
    return session.sessionEvents$;
  }

  // Escuta os eventos do SessionMonitorService
  private listenForSessionMonitorEvents() {
    this.sessionMonitorService.getUnexpectedDisconnection$().subscribe((event) => {
      this.reconnectSession(event.sessionId);
    });

    this.sessionMonitorService.getLogoutDisconnection$().subscribe(async (event) => {
      await this.authStateService.deleteAuthState(event.sessionId);
    });

    this.sessionMonitorService.getCredsUpdate$().subscribe(async (event) => {
      await this.saveSessionCreds(event.sessionId, event.creds);
    });
  }

  private async reconnectSession(sessionId: string) {
    const session = this.sessionStateService.find(sessionId);
    if (!session) throw new Error('Sessão não existe');

    const state = await this.authStateService.getAuthState(sessionId);
    session.reconectarSessao(state);
  }

  private async saveSessionCreds(sessionId: string, creds: AuthenticationCreds) {
    const session = this.sessionStateService.find(sessionId);
    if (!session) throw new Error('Sessão não existe');

    await this.authStateService.saveCreds(sessionId, creds);
  }
}
