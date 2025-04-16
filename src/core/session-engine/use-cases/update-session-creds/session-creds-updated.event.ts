import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionCredsUpdatedEvent extends DomainEvent {
  constructor(
    sessionId: string,
    phone: string,
    phonePlatform: string
  ) {
    super(sessionId, 'session.creds.updated', { sessionId, phone, phonePlatform });
  }
}
