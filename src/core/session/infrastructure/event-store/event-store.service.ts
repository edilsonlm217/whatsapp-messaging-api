import { Injectable } from '@nestjs/common';
import { SessionEventsRepository } from 'src/database/event-store/repositories/session-events.repository';
import { JSONType } from '@eventstore/db-client';

@Injectable()
export class EventStoreService {
  constructor(
    private readonly sessionEventsRepository: SessionEventsRepository,
  ) { }

  // Restrição de T para garantir que seja um tipo compatível com JSONType
  async appendEvent<T extends JSONType>(sessionId: string, eventType: string, data: T): Promise<void> {
    await this.sessionEventsRepository.appendEvent(sessionId, eventType, data);
  }

  async readEvents(sessionId: string) {
    return await this.sessionEventsRepository.readEvents(sessionId);
  }
}
