import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from './session-created.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(SessionCreatedEvent)
@Injectable()
export class SessionCreatedHandler implements IEventHandler<SessionCreatedEvent> {
  constructor(
    private readonly sessionEventsStore: SessionEventsStore,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async handle(event: SessionCreatedEvent) {
    const { sessionId } = event;

    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'SessionCreated',
      payload: {
        sessionId: sessionId,
      }
    });

    // Emitindo o evento 'session.created'
    this.eventEmitter.emit('session.created', { sessionId });
  }
}
