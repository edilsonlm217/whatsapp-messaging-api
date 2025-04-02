import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { AuthStateService } from './auth-state/auth-state.service';
import { SessionRepository } from './session.repository';
import { WhatsAppSession } from './whatsapp-session';
import { ConnectionStatusEnum, DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';

@Injectable()
export class SessionManager implements OnModuleInit, OnModuleDestroy {
  private sessionStateSubscription: Subscription;

  constructor(
    private readonly authStateService: AuthStateService,
    private readonly sessionRepository: SessionRepository
  ) { }

  onModuleInit() {
    // Assina mudanças no estado das sessões
    const eventStream = this.sessionRepository.getSessionStateChanges$();
    this.sessionStateSubscription = eventStream.subscribe(({ sessionId, action }) => {
      if (action === 'created') { this.observeSession(sessionId) }
    });
  }

  onModuleDestroy() {
    // Garante que a assinatura seja removida ao destruir o módulo
    this.sessionStateSubscription.unsubscribe();
  }

  /**
   * Cria e armazena uma nova sessão do WhatsApp.
   */
  async createSession(sessionId: string): Promise<WhatsAppSession> {
    const sessionExists = this.sessionRepository.find(sessionId);
    if (sessionExists) { throw new Error('Sessão já existe') }
    const session = new WhatsAppSession(sessionId, this.authStateService);
    this.sessionRepository.save(sessionId, session);
    await session.iniciarSessao()
    return session;
  }

  /**
   * Encerra uma sessão específica.
   */
  async logout(sessionId: string): Promise<void> {
    const session = this.sessionRepository.find(sessionId);
    if (!session) { throw new Error('Sessão não existe') }
    await session.logout();
    console.log(`Sessão ${sessionId} removida.`);
  }

  /**
   * Obtém uma instância da sessão específica.
   */
  getSession(sessionId: string) {
    return this.sessionRepository.find(sessionId);
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

  /**
   * Observa eventos de uma sessão específica.
   */
  private observeSession(sessionId: string): void {
    const session = this.sessionRepository.find(sessionId);
    if (!session) { throw new Error('Sessão não existe') }
    const subscription = session.sessionEvents$.subscribe((event) => {
      if (!event) { return }
      const { status, reason } = event.data.session.connection;
      if (status === ConnectionStatusEnum.DISCONNECTED && reason === DisconnectionReasonEnum.LOGOUT) {
        this.sessionRepository.delete(sessionId);
        subscription.unsubscribe(); // Remove a assinatura para evitar vazamento de memória
      }
    });
  }
}
