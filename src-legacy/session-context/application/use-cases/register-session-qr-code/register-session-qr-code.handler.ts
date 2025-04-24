import { Injectable } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { RegisterSessionQRCodeCommand } from "./register-session-qr-code.command";
import { Session } from "src/session-context/domain/session.aggregate";
import { SessionEventsStore } from "src/session-context/infrastructure/persistence/eventstores/session-events.store";

@CommandHandler(RegisterSessionQRCodeCommand)
@Injectable()
export class RegisterSessionQRCodeHandler implements ICommandHandler<RegisterSessionQRCodeCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly sessionEventsStore: SessionEventsStore
  ) { }

  async execute(command: RegisterSessionQRCodeCommand): Promise<void> {
    const { sessionId, qrCode } = command;
    const events = await this.sessionEventsStore.readEvents(sessionId);
    const session = this.publisher.mergeObjectContext(Session.rehydrateFromHistory(events));
    session.registerQRCode(qrCode);
    session.commit();
  }
}
