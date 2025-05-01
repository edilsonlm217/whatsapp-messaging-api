import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { StructuredEvent } from '../../common/structured-event.interface';

@Injectable()
export class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  // Método para emitir eventos
  emitEvent<TPayload = Record<string, unknown>>(
    sessionId: string,
    eventType: string,
    source: string,
    origin: string,
    payload: TPayload
  ): void {
    const event: StructuredEvent<TPayload> = {
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      sessionId,
      eventType,
      source,
      origin,
      payload,
    };

    this.eventEmitter.emit(eventType, event);
  }
}
