import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionClosedEvent } from './session-closed.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';

@EventsHandler(SessionClosedEvent)
@Injectable()
export class SessionClosedHandler implements IEventHandler<SessionClosedEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: SessionClosedEvent) {
    const { sessionId, reason } = event;
    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionClosed',
      payload: {
        sessionId: sessionId,
        reason: reason
      }
    });
  }
}