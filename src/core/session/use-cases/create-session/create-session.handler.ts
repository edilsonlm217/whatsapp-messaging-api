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
    const session = this.publisher.mergeObjectContext(new Session(sessionId));
    session.create();
    session.commit();
  }
}
