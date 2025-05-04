import { Injectable } from '@nestjs/common';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';
import { StructuredEvent } from 'src/common/structured-event.interface';

@Injectable()
export class InconsistentStateEmitterService {
  constructor(private readonly eventEmitterService: EventEmitterService) { }

  emitInconsistentState(event: StructuredEvent<any>, origin: string, error: Error) {
    this.eventEmitterService.emitEvent(
      event.sessionId,
      'InconsistentStateDetected',
      'InconsistentStateEmitterService',
      origin,
      {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        originalEvent: event,
      }
    );
  }
}
