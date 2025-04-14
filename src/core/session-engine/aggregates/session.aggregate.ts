import { AggregateRoot } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '../events/session-created/session-created.event';
import { QRCodeRegisteredEvent } from '../events/qr-code-registered/qr-code-registered.event';

export class Session extends AggregateRoot {
  constructor(private readonly sessionId: string) {
    super();
  }

  // Método de criação da sessão
  create() {
    this.apply(new SessionCreatedEvent(this.sessionId));
  }

  // Método para registrar QR code
  registerQRCode(qrCode: string) {
    this.apply(new QRCodeRegisteredEvent(this.sessionId, qrCode));
  }

  // Rehidratação do aggregate a partir do histórico de eventos
  static rehydrateFromHistory(events: any[]): Session {
    const first = events[0];
    const session = new Session(first.event.data.aggregateId); // ou `first.sessionId`, dependendo do seu payload

    for (const event of events) {
      session.apply(event, true); // `true` marca como evento histórico
    }

    return session;
  }
}
