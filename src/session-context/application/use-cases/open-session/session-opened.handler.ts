import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionOpenedEvent } from './session-opened.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from 'src/session-context/infrastructure/persistence/eventstores/session-events.store';

@EventsHandler(SessionOpenedEvent)
@Injectable()
export class SessionOpenedHandler implements IEventHandler<SessionOpenedEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: SessionOpenedEvent) {
    const { sessionId } = event;
    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionOpened',
      payload: {
        sessionId: sessionId
      }
    });
  }
}
