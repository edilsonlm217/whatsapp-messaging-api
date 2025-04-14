import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionCredsUpdatedEvent extends DomainEvent {
  constructor(sessionId: string) {
    super(sessionId, 'session.creds.updated', { sessionId });
  }
}
