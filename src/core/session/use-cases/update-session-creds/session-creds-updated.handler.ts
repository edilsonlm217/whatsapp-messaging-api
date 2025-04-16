import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCredsUpdatedEvent } from './session-creds-updated.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';

@EventsHandler(SessionCredsUpdatedEvent)
@Injectable()
export class SessionCredsUpdatedHandler implements IEventHandler<SessionCredsUpdatedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionCredsUpdatedEvent): Promise<void> {
    // O event provavelmente possui dados que você quer armazenar na store
    const { aggregateId, occurredOn, payload, type } = event;

    // Você pode gravar esse evento no EventStoreDB usando o EventStoreService
    // Aqui estamos apenas enviando um evento de exemplo. Ajuste conforme sua necessidade
    const eventData = { type, aggregateId, occurredOn, payload };  // Dados do evento a serem salvos

    await this.eventStore.appendEvent(aggregateId, 'SessionCredsUpdated', eventData);

    // Caso você precise fazer algo adicional (como registrar logs, notificar outros serviços, etc), faça aqui.
  }
}
