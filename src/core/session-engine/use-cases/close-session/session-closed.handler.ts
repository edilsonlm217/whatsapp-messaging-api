import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionClosedEvent } from './session-closed.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';
import { RestartSessionCommand } from '../restart-session/restart-session.command';
import { WhatsAppService } from '../../infrastructure/whatsapp/whatsapp.service';

@EventsHandler(SessionClosedEvent)
@Injectable()
export class SessionClosedHandler implements IEventHandler<SessionClosedEvent> {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly commandBus: CommandBus,
    private readonly whatsAppService: WhatsAppService,
  ) { }

  async handle(event: SessionClosedEvent): Promise<void> {
    const { aggregateId, occurredOn, payload, type } = event;

    const eventData = { type, aggregateId, occurredOn, payload };

    // Remove sessão dos gerenciador de sockets
    this.whatsAppService.removeSocket(payload.sessionId);

    // Registra evento de fechamento de sessão
    await this.eventStore.appendEvent(aggregateId, 'SessionClosed', eventData);

    // Tenta reconectar em caso de fechamento inesperado
    if (payload.reason === 'Closed unexpectedly') {
      console.log('SessionClosedHandler disparando comando para reiniciar');
      await this.commandBus.execute(new RestartSessionCommand(payload.sessionId));
    }
  }
}