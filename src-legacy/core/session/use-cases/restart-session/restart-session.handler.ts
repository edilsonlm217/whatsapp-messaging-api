import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Session } from "../../domain/session.aggregate";
import { RestartSessionCommand } from "./restart-session.command";
import { SessionEventsStore } from "../../infrastructure/session-event-store/session-events.store";

@CommandHandler(RestartSessionCommand)
@Injectable()
export class RestartSessionHandler implements ICommandHandler<RestartSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore,
  ) { }

  async execute(command: RestartSessionCommand): Promise<void> {
    const { sessionId } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.restart();
    session.commit();
  }
}
