import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from './session-created.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';

@EventsHandler(SessionCreatedEvent)
@Injectable()
export class SessionCreatedHandler implements IEventHandler<SessionCreatedEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: SessionCreatedEvent) {
    const { sessionId } = event;

    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionCreated',
      payload: {
        sessionId: sessionId,
      }
    });
  }
}
