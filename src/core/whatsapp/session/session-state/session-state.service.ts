import { Injectable } from '@nestjs/common';
import { WhatsAppSession } from '../whatsapp-session';
import { Subject } from 'rxjs';

export interface SessionStateChange {
  sessionId: string;
  action: 'created' | 'deleted';
}

@Injectable()
export class SessionStateService {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private sessionStateChanges$: Subject<SessionStateChange> = new Subject();

  // Persiste uma sessão no repositório.
  save(sessionId: string, session: WhatsAppSession): void {
    this.sessions.set(sessionId, session);
    this.sessionStateChanges$.next({ sessionId, action: 'created' }); // Emite evento de sessão criada
  }

  // Remove uma sessão do repositório.
  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.sessionStateChanges$.next({ sessionId, action: 'deleted' }); // Emite evento de sessão removida
  }

  // Retorna a sessão armazenada pelo sessionId, ou undefined se não encontrada.
  find(sessionId: string): WhatsAppSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Retorna todas as chaves (IDs de sessões) do repositório.
  findAll(): string[] {
    return Array.from(this.sessions.keys());
  }

  // Expor o Subject como um Observable para que outros serviços possam assinar as mudanças.
  getSessionStateChanges$() {
    return this.sessionStateChanges$.asObservable();
  }
}
