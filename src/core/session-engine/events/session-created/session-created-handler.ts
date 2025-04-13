import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SessionCreatedEvent } from "./session-created.event";
import { Injectable } from "@nestjs/common";
import { EventStoreService } from "../../infrastructure/event-store/event-store.service";

@EventsHandler(SessionCreatedEvent)
@Injectable()
export class SessionCreatedHandler implements IEventHandler<SessionCreatedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionCreatedEvent): Promise<void> {
    await this.eventStore.save([event]);
  }
}
