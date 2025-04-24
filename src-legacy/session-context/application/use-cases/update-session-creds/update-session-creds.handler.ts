import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSessionCredsCommand } from "./update-session-creds.command";
import { Session } from "src/session-context/domain/session.aggregate";
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";

@CommandHandler(UpdateSessionCredsCommand)
@Injectable()
export class UpdateSessionCredsHandler implements ICommandHandler<UpdateSessionCredsCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore,
  ) { }

  async execute(command: UpdateSessionCredsCommand): Promise<void> {
    const { sessionId, phone, phonePlatform } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.updateCreds(phone, phonePlatform);
    session.commit();
  }
}
