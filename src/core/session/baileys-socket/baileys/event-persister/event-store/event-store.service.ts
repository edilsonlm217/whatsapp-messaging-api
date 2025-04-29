import { Inject, Injectable } from '@nestjs/common';
import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client';
import { BaileysEventDto } from './dtos/baileys-event.dto';

@Injectable()
export class EventsStoreService {
  private static readonly STREAM_PREFIX = 'baileys';

  constructor(
    @Inject('EVENTSTORE_CONNECTION')
    private readonly eventStore: EventStoreDBClient,
  ) { }

  async append(event: BaileysEventDto) {
    const stream = this.getStreamName(event.sessionId);
    const json = jsonEvent({
      type: event.type,
      data: {
        occurredOn: new Date().toISOString(),
        aggregateId: event.aggregateId,
        payload: event.payload,
      },
    });

    await this.eventStore.appendToStream(stream, [json]);
  }

  private getStreamName(sessionId: string) {
    return `${EventsStoreService.STREAM_PREFIX}-${sessionId}`;
  }
}
