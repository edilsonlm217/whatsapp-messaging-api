import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionClosedEvent } from './session-closed.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(SessionClosedEvent)
@Injectable()
export class SessionClosedHandler implements IEventHandler<SessionClosedEvent> {
  constructor(
    private readonly sessionEventsStore: SessionEventsStore,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async handle(event: SessionClosedEvent) {
    const { sessionId, reason } = event;

    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionClosed',
      payload: {
        sessionId,
        reason,
      },
    });

    if (reason === 'unexpected') {
      this.eventEmitter.emit('session.restart-required', {
        sessionId,
      });
    }
  }
}

