import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Session } from "../../domain/session.aggregate";
import { WhatsAppService } from "../../infrastructure/whatsapp/whatsapp.service";
import { AuthStateService } from "src/core/auth-state/auth-state.service";
import { RestartSessionCommand } from "./restart-session.command";
import { EventStoreService } from "../../infrastructure/event-store/event-store.service";

@CommandHandler(RestartSessionCommand)
@Injectable()
export class RestartSessionHandler implements ICommandHandler<RestartSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly eventStore: EventStoreService,
    private readonly whatsAppService: WhatsAppService,
    private readonly authStateService: AuthStateService
  ) { }

  async execute(command: RestartSessionCommand): Promise<void> {
    const { sessionId } = command;

    // Lê os eventos persistidos
    const events = await this.eventStore.readEvents(sessionId);

    // Recria o agregado a partir dos eventos
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));

    // Aplica o novo evento
    session.restart();

    // Comita para o EventBus
    session.commit();

    // // Inicializa o socket através do WhatsAppInfraService
    const state = await this.authStateService.getAuthState(sessionId);
    this.whatsAppService.createSocket(sessionId, state);
  }
}
