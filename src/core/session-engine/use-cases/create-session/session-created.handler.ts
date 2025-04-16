import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionCreatedEvent } from './session-created.event';
import { Injectable } from '@nestjs/common';
import { EventStoreService } from '../../infrastructure/event-store/event-store.service';

@EventsHandler(SessionCreatedEvent)
@Injectable()
export class SessionCreatedHandler implements IEventHandler<SessionCreatedEvent> {
  constructor(private readonly eventStore: EventStoreService) { }

  async handle(event: SessionCreatedEvent): Promise<void> {
    // O event provavelmente possui dados que você quer armazenar na store
    const { aggregateId, occurredOn, payload, type } = event;

    // Você pode gravar esse evento no EventStoreDB usando o EventStoreService
    // Aqui estamos apenas enviando um evento de exemplo. Ajuste conforme sua necessidade
    const eventData = { type, aggregateId, occurredOn, payload };  // Dados do evento a serem salvos

    await this.eventStore.appendEvent(aggregateId, 'SessionCreated', eventData);

    // Caso você precise fazer algo adicional (como registrar logs, notificar outros serviços, etc), faça aqui.
  }
}
