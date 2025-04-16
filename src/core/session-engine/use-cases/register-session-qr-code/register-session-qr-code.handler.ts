import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { RegisterSessionQRCodeCommand } from "./register-session-qr-code.command";
import { EventStoreService } from "../../infrastructure/event-store/event-store.service";
import { Session } from "../../aggregates/session.aggregate";

@CommandHandler(RegisterSessionQRCodeCommand)
@Injectable()
export class RegisterSessionQRCodeHandler implements ICommandHandler<RegisterSessionQRCodeCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly eventStore: EventStoreService
  ) { }

  async execute(command: RegisterSessionQRCodeCommand): Promise<void> {
    const { sessionId, qrCode } = command;

    // Lê os eventos persistidos
    const events = await this.eventStore.readEvents(sessionId);
    
    // Recria o agregado a partir dos eventos
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));

    // Aplica o novo evento
    session.registerQRCode(qrCode);

    // Comita para o EventBus
    session.commit();
  }
}
