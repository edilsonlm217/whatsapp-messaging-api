import { Injectable } from '@nestjs/common';
import { EventRepository } from 'src/database/repositories/event.repository';
import { DomainEvent } from './domain-event.interface';

@Injectable()
export class EventStoreService {
  constructor(private readonly eventRepository: EventRepository) { }

  async save(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const storedEvent = {
        aggregateId: event.aggregateId,
        type: event.type,
        payload: event.payload,
        occurredOn: event.occurredOn.toISOString(),
      };

      await this.eventRepository.save(storedEvent);
    }
  }

  async getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]> {
    const storedEvents = await this.eventRepository.findByAggregateId(aggregateId);

    return storedEvents.map(event => ({
      aggregateId: event.aggregateId,
      type: event.type,
      payload: event.payload,
      occurredOn: new Date(event.occurredOn),
    }));
  }
}
