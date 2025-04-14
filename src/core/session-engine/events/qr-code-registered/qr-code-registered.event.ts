import { DomainEvent } from "../../infrastructure/event-store/domain-event";

export class QRCodeRegisteredEvent extends DomainEvent {
  constructor(sessionId: string, qrCode: string) {
    super(sessionId, 'session.qr_code_registered', { sessionId, qrCode });
  }
}
