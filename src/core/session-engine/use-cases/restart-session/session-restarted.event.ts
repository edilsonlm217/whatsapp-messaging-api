import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class SessionRestartedEvent extends DomainEvent {
  constructor(sessionId: string) {
    super(sessionId, 'session.restarted', { sessionId });
  }
}
