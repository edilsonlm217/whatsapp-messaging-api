import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSessionCredsCommand } from "./update-session-creds.command";
import { EventStoreService } from "../../infrastructure/event-store/event-store.service";
import { Session } from "../../domain/session.aggregate";
import { AuthStateService } from "src/core/session/infrastructure/auth-state/auth-state.service";

@CommandHandler(UpdateSessionCredsCommand)
@Injectable()
export class UpdateSessionCredsHandler implements ICommandHandler<UpdateSessionCredsCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly eventStore: EventStoreService,
    private readonly authStateService: AuthStateService,
  ) { }

  async execute(command: UpdateSessionCredsCommand): Promise<void> {
    const { sessionId, phone, phonePlatform, creds } = command;

    // Lê os eventos persistidos
    const events = await this.eventStore.readEvents(sessionId);

    // Recria o agregado a partir dos eventos
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));

    // Aplica o novo evento
    session.updateCreds(phone, phonePlatform);

    // Persiste as credenciais
    await this.authStateService.saveCreds(sessionId, creds);

    // Comita para o EventBus
    session.commit();
  }
}
