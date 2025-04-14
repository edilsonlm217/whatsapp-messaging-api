import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionClosedEvent extends DomainEvent {
  constructor(sessionId: string) {
    super(sessionId, 'session.closed', { sessionId });
  }
}
