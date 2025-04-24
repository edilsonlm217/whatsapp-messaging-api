import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { QRCodeRegisteredEvent } from './qr-code-registered.event';
import { Injectable } from '@nestjs/common';
import { SessionEventsStore } from '../../infrastructure/session-event-store/session-events.store';
@EventsHandler(QRCodeRegisteredEvent)
@Injectable()
export class QRCodeRegisteredHandler implements IEventHandler<QRCodeRegisteredEvent> {
  constructor(private readonly sessionEventsStore: SessionEventsStore) { }

  async handle(event: QRCodeRegisteredEvent) {
    const { sessionId, qrCode } = event;
    await this.sessionEventsStore.append({
      aggregateId: sessionId,
      type: 'QRCodeRegistered',
      payload: {
        sessionId: sessionId,
        qrCode: qrCode
      }
    });
  }
}
