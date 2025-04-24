import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CloseSessionCommand } from "./close-session.command";
import { Session } from "src/session-context/domain/session.aggregate";
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";

@CommandHandler(CloseSessionCommand)
@Injectable()
export class CloseSessionHandler implements ICommandHandler<CloseSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore
  ) { }

  async execute(command: CloseSessionCommand) {
    const { sessionId, reason } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.close(reason);
    session.commit();
  }
}
