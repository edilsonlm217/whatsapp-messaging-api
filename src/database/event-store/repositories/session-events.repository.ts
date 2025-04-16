import { Inject, Injectable } from '@nestjs/common';
import {
  EventStoreDBClient,
  FORWARDS,
  START,
  ResolvedEvent,
} from '@eventstore/db-client';

import { jsonEvent, JSONType } from '@eventstore/db-client';

@Injectable()
export class SessionEventsRepository {
  constructor(
    @Inject('EVENTSTORE_CONNECTION')
    private readonly eventStore: EventStoreDBClient,
  ) { }

  private getStreamName(sessionId: string): string {
    return `session-${sessionId}`;
  }

  async appendEvent<T extends JSONType>(
    sessionId: string,
    eventType: string,
    data: T,
  ): Promise<void> {
    const event = jsonEvent({
      type: eventType,
      data, // 'data' agora deve ser um tipo compatível com JSONType
    });

    await this.eventStore.appendToStream(this.getStreamName(sessionId), [event]);
  }

  async readEvents(sessionId: string): Promise<ResolvedEvent[]> {
    const events = this.eventStore.readStream(this.getStreamName(sessionId), {
      direction: FORWARDS,
      fromRevision: START,
    });

    const allEvents: ResolvedEvent[] = [];
    for await (const resolvedEvent of events) {
      allEvents.push(resolvedEvent);
    }

    return allEvents;
  }
}
