import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { CreateSessionCommand } from "./create-session.command";
import { Session } from "src/session-context/domain/session.aggregate";
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";

@CommandHandler(CreateSessionCommand)
@Injectable()
export class CreateSessionHandler implements ICommandHandler<CreateSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore,
  ) { }

  async execute(command: CreateSessionCommand): Promise<void> {
    const { sessionId } = command;
    const session = this.publisher.mergeObjectContext(new Session(sessionId));
    session.create();
    session.commit();
  }
}
