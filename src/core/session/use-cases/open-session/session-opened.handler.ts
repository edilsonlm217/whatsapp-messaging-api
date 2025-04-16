import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionOpenedEvent } from './session-opened.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';

@EventsHandler(SessionOpenedEvent)
@Injectable()
export class SessionOpenedHandler implements IEventHandler<SessionOpenedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionOpenedEvent): Promise<void> {
    const { aggregateId, occurredOn, payload, type } = event;

    const eventData = { type, aggregateId, occurredOn, payload };

    await this.eventStore.appendEvent(aggregateId, 'SessionOpened', eventData);
  }
}
