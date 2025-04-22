import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Session } from "../../domain/session.aggregate";
import { CreateSessionCommand } from "./create-session.command";
import { SessionEventsStore } from "../../infrastructure/session-event-store/session-events.store";

@CommandHandler(CreateSessionCommand)
@Injectable()
export class CreateSessionHandler implements ICommandHandler<CreateSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore,
  ) { }

  async execute(command: CreateSessionCommand): Promise<void> {
    const { sessionId } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.create();
    session.commit();
  }
}
