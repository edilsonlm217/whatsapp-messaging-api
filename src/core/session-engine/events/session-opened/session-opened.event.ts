import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionOpenedEvent extends DomainEvent {
  constructor(sessionId: string) {
    super(sessionId, 'session.opened', { sessionId });
  }
}
