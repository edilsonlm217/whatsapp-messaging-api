import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { SessionRestartedEvent } from './session-restarted.event';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';

@EventsHandler(SessionRestartedEvent)
@Injectable()
export class SessionRestartedHandler implements IEventHandler<SessionRestartedEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: SessionRestartedEvent) {
    const { sessionId } = event;
    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionRestarted',
      payload: {
        sessionId: sessionId
      }
    });
  }
}
