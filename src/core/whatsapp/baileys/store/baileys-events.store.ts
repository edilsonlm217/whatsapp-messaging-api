import { Inject, Injectable } from '@nestjs/common';
import { EventStoreDBClient, jsonEvent, START } from '@eventstore/db-client';
import { BaileysRawEvent } from '../interface/baileys-raw-event.interface';

@Injectable()
export class BaileysEventsStore {
  constructor(
    @Inject('EVENTSTORE_CONNECTION')
    private readonly eventStore: EventStoreDBClient,
  ) { }

  async append(event: BaileysRawEvent) {
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

  getCategoryStream() {
    return this.eventStore.subscribeToStream('$ce-baileys', {
      fromRevision: START,
    });
  }

  getSessionStream(sessionId: string) {
    const stream = this.getStreamName(sessionId);
    return this.eventStore.subscribeToStream(stream, {
      fromRevision: START,
    });
  }

  private getStreamName(sessionId: string) {
    return `baileys-${sessionId}`;
  }
}
