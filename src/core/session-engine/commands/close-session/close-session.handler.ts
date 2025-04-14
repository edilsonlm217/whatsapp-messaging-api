import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CloseSessionCommand } from "./close-session.command";
import { EventStoreService } from "../../infrastructure/event-store/event-store.service";
import { Session } from "../../aggregates/session.aggregate";

@CommandHandler(CloseSessionCommand)
@Injectable()
export class CloseSessionHandler implements ICommandHandler<CloseSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly eventStore: EventStoreService
  ) { }

  async execute(command: CloseSessionCommand): Promise<void> {
    const { sessionId } = command;

    // Lê os eventos persistidos
    const events = await this.eventStore.readEvents(sessionId);

    // Recria o agregado a partir dos eventos
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));

    // Aplica o novo evento
    session.close();

    // Comita para o EventBus
    session.commit();
  }
}
