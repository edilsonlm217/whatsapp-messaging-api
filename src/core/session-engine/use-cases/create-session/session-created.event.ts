import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionCreatedEvent extends DomainEvent {
  constructor(sessionId: string) {
    super(sessionId, 'session.created', { sessionId });
  }
}
