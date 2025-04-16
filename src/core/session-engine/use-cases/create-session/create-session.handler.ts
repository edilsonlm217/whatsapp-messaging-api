import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { Session } from "../../aggregates/session.aggregate";
import { WhatsAppService } from "../../infrastructure/whatsapp/whatsapp.service";
import { AuthStateService } from "src/core/auth-state/auth-state.service";
import { CreateSessionCommand } from "./create-session.command";

@CommandHandler(CreateSessionCommand)
@Injectable()
export class CreateSessionHandler implements ICommandHandler<CreateSessionCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly whatsAppService: WhatsAppService,
    private readonly authStateService: AuthStateService
  ) { }

  async execute(command: CreateSessionCommand): Promise<void> {
    const { sessionId } = command;

    // Cria o Aggregate (Session)
    const session = this.publisher.mergeObjectContext(new Session(sessionId));

    // Inicializa o socket através do WhatsAppInfraService
    const state = await this.authStateService.getAuthState(sessionId);
    this.whatsAppService.createSocket(sessionId, state);

    // Aplica o evento de criação da sessão
    session.create(); // Passa o socket para o Aggregate

    // O agregado agora vai reagir ao evento de conexão e seus respectivos eventos de QRCode, open, close
    session.commit(); // Dispara o evento no EventBus
  }
}
