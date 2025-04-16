import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';
import { SessionRestartedEvent } from './session-restarted.event';

@EventsHandler(SessionRestartedEvent)
@Injectable()
export class SessionRestartedHandler implements IEventHandler<SessionRestartedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionRestartedEvent): Promise<void> {
    console.log('SessionRestartedHandler is running');
    const { aggregateId, occurredOn, payload, type } = event;

    const eventData = { type, aggregateId, occurredOn, payload };

    await this.eventStore.appendEvent(aggregateId, 'SessionRestarted', eventData);
  }
}
