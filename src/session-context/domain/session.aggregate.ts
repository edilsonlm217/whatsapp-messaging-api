import { AggregateRoot } from '@nestjs/cqrs';
import { SessionCreatedEvent } from '../application/use-cases/create-session';
import { QRCodeRegisteredEvent } from '../application/use-cases/register-session-qr-code';
import { SessionOpenedEvent } from '../application/use-cases/open-session';
import { SessionClosedEvent } from '../application/use-cases/close-session';
import { SessionRestartedEvent } from '../application/use-cases/restart-session';
import { SessionCredsUpdatedEvent } from '../application/use-cases/update-session-creds';
import { SessionLoggedOutEvent } from '../application/use-cases/logout-session/session-logged-out.event';

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

  // Método para deslogar a sessão
  logout() {
    this.apply(new SessionLoggedOutEvent(this.sessionId));
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
