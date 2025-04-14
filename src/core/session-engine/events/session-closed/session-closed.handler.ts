import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionClosedEvent } from './session-closed.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';

@EventsHandler(SessionClosedEvent)
@Injectable()
export class SessionClosedHandler implements IEventHandler<SessionClosedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionClosedEvent): Promise<void> {
    const { aggregateId, occurredOn, payload, type } = event;

    const eventData = { type, aggregateId, occurredOn, payload };

    await this.eventStore.appendEvent(aggregateId, 'SessionClosed', eventData);
  }
}