import { AggregateRoot } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '../use-cases/create-session/session-created.event';
import { QRCodeRegisteredEvent } from '../events/qr-code-registered/qr-code-registered.event';
import { SessionOpenedEvent } from '../use-cases/open-session';
import { SessionClosedEvent } from '../use-cases/close-session';
import { SessionRestartedEvent } from '../use-cases/restart-session';
import { SessionCredsUpdatedEvent } from '../use-cases/update-session-creds';

export class Session extends AggregateRoot {
  constructor(private readonly sessionId: string) {
    super();
  }

  // Método de criação da sessão
  create() {
    this.apply(new SessionCreatedEvent(this.sessionId));
  }

  // Método de criação da sessão
  restart() {
    console.log('Agregado dando apply em SessionRestartedEvent');
    this.apply(new SessionRestartedEvent(this.sessionId));
  }

  // Método para registrar QR code
  registerQRCode(qrCode: string) {
    this.apply(new QRCodeRegisteredEvent(this.sessionId, qrCode));
  }

  // Método para abrir a sessão
  open() {
    this.apply(new SessionOpenedEvent(this.sessionId));
  }

  // Método para fechar a sessão
  close(reason: string) {
    this.apply(new SessionClosedEvent(this.sessionId, reason));
  }

  // Método para atualizar credenciais
  updateCreds(phone: string, phonePlatform: string) {
    this.apply(new SessionCredsUpdatedEvent(this.sessionId, phone, phonePlatform));
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
