import { Injectable } from '@nestjs/common';
import { StateRepository } from './repositories/state.repository';
import { SessionState } from '../session-state.model';

@Injectable()
export class StateStoreService {
  constructor(
    private readonly stateRepository: StateRepository,
  ) { }

  // Recupera o estado da sessão a partir do Redis
  async get(sessionId: string) {
    return this.stateRepository.get(sessionId);
  }

  // Persiste o estado da sessão no Redis
  async set(sessionId: string, session: SessionState): Promise<void> {
    console.log(StateStoreService.name, session);
    await this.stateRepository.set(sessionId, session);
  }

  // Deleta a sessão do Redis
  async delete(sessionId: string): Promise<void> {
    await this.stateRepository.delete(sessionId);
  }
}
