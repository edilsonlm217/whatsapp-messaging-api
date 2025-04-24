import { Inject, Injectable } from '@nestjs/common';
import { EventStoreDBClient, FORWARDS, jsonEvent, ResolvedEvent, START } from '@eventstore/db-client';
import { SessionEventDto } from '../dtos/session-event.dto';

@Injectable()
export class SessionEventsStore {
  private static readonly STREAM_PREFIX = 'session';

  constructor(
    @Inject('EVENTSTORE_CONNECTION')
    private readonly eventStore: EventStoreDBClient,
  ) { }

  async append(event: SessionEventDto) {
    const stream = this.getStreamName(event.aggregateId);
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

  async readEvents(sessionId: string): Promise<ResolvedEvent[]> {
    const stream = this.getStreamName(sessionId);
    const events = this.eventStore.readStream(stream, {
      direction: FORWARDS,
      fromRevision: START,
    });

    const allEvents: ResolvedEvent[] = [];
    for await (const resolvedEvent of events) {
      allEvents.push(resolvedEvent);
    }

    return allEvents;
  }

  private getStreamName(sessionId: string) {
    return `${SessionEventsStore.STREAM_PREFIX}-${sessionId}`;
  }
}
