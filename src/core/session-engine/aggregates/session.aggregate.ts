import { AggregateRoot } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '../events/session-created/session-created.event';

export class Session extends AggregateRoot {
  constructor(private readonly sessionId: string) {
    super();
  }

  // Método para criar a sessão
  create() {
    this.apply(new SessionCreatedEvent(this.sessionId)); // Aplica o evento com o socket
  }
}
