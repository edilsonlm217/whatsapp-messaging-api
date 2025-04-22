import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { OpenSessionCommand } from "./open-session.command";
import { Session } from "../../domain/session.aggregate";
import { SessionEventsStore } from "../../infrastructure/session-event-store/session-events.store";

@CommandHandler(OpenSessionCommand)
@Injectable()
export class OpenSessionHandler implements ICommandHandler<OpenSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore
  ) { }

  async execute(command: OpenSessionCommand): Promise<void> {
    const { sessionId } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.open();
    session.commit();
  }
}
