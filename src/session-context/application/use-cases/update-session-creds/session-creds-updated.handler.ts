import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCredsUpdatedEvent } from './session-creds-updated.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from 'src/session-context/infrastructure/persistence/eventstores/session-events.store';

@EventsHandler(SessionCredsUpdatedEvent)
@Injectable()
export class SessionCredsUpdatedHandler implements IEventHandler<SessionCredsUpdatedEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: SessionCredsUpdatedEvent) {
    const { sessionId, phone, phonePlatform } = event;
    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionCredsUpdated',
      payload: {
        sessionId: sessionId,
        phone: phone,
        phonePlatform: phonePlatform
      }
    });
  }
}
