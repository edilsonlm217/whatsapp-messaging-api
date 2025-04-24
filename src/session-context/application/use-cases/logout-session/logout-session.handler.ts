import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { LogoutSessionCommand } from "./logout-session.command";
import { Session } from "src/session-context/domain/session.aggregate";
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";

@CommandHandler(LogoutSessionCommand)
@Injectable()
export class LogoutSessionHandler implements ICommandHandler<LogoutSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore
  ) { }

  async execute(command: LogoutSessionCommand) {
    const { sessionId } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.logout();
    session.commit();
  }
}
