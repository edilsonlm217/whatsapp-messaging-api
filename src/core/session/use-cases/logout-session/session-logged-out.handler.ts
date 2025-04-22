import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionLoggedOutEvent } from './session-logged-out.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(SessionLoggedOutEvent)
@Injectable()
export class SessionClosedHandler implements IEventHandler<SessionLoggedOutEvent> {
  constructor(
    private readonly sessionEventsStore: SessionEventsStore,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async handle(event: SessionLoggedOutEvent) {
    const { sessionId } = event;

    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionLoggedOut',
      payload: {
        sessionId
      },
    });

    this.eventEmitter.emit('session.logged-out', { sessionId });
  }
}
