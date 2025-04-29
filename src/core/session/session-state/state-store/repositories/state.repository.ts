import { Injectable } from '@nestjs/common';
import { SessionState } from '../../session-state.model';

@Injectable()
export class StateRepository {
  constructor() { }

  // Retorna o último estado da sessão
  async get(sessionId: string) { }

  // Adiciona um novo estado no stream (não sobrescreve)
  async set(sessionId: string, session: SessionState): Promise<void> { }

  // Deleta toda a lista de estados da sessão
  async delete(sessionId: string): Promise<void> { }
}
