import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { QRCodeRegisteredEvent } from './qr-code-registered.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';

@EventsHandler(QRCodeRegisteredEvent)
@Injectable()
export class QRCodeRegisteredHandler implements IEventHandler<QRCodeRegisteredEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: QRCodeRegisteredEvent): Promise<void> {
    const { aggregateId, occurredOn, payload, type } = event;

    const eventData = { type, aggregateId, occurredOn, payload };

    await this.eventStore.appendEvent(aggregateId, 'QRCodeRegistered', eventData);
  }
}
