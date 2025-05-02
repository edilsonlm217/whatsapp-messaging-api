import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DisconnectReason,
  ConnectionState,
  AuthenticationCreds,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';
import { StructuredEvent } from 'src/common/structured-event.interface';
import {
  QrCodeGeneratedPayload,
  ConnectionOpenedPayload,
  ConnectionClosedPayload,
  ConnectionLoggedOutPayload,
  CredsUpdatedPayload,
} from 'src/common/session-events.interface';

@Injectable()
export class EventInterpreterService {
  constructor(private readonly eventEmitterService: EventEmitterService) { }

  @OnEvent('ConnectionUpdate')
  async onConnectionUpdate(event: StructuredEvent<ConnectionState>) {
    if (event.payload.qr) {
      this.eventEmitterService.emitEvent<QrCodeGeneratedPayload>(
        event.sessionId,
        'QrCodeGenerated',
        'session',
        EventInterpreterService.name,
        { qr: event.payload.qr }
      );
      return;
    }

    if (event.payload.connection === 'open') {
      this.eventEmitterService.emitEvent<ConnectionOpenedPayload>(
        event.sessionId,
        'ConnectionOpened',
        'session',
        EventInterpreterService.name,
        { connection: 'open' }
      );
      return;
    }

    if (event.payload.connection === 'close') {
      const error = event.payload.lastDisconnect?.error as Boom;
      const statusCode = error?.output?.statusCode;
      const restartRequired = statusCode !== DisconnectReason.loggedOut;

      if (restartRequired) {
        this.eventEmitterService.emitEvent<ConnectionClosedPayload>(
          event.sessionId,
          'ConnectionClosed',
          'session',
          EventInterpreterService.name,
          { connection: 'close' }
        );
      } else {
        this.eventEmitterService.emitEvent<ConnectionLoggedOutPayload>(
          event.sessionId,
          'ConnectionLoggedOut',
          'session',
          EventInterpreterService.name,
          { connection: 'logged-out' }
        );
      }
    }
  }

  @OnEvent('CredsUpdate')
  async onCredsUpdate(event: StructuredEvent<AuthenticationCreds>) {
    this.eventEmitterService.emitEvent<AuthenticationCreds>(
      event.sessionId,
      'CredsUpdated',
      'session',
      EventInterpreterService.name,
      event.payload
    );
  }
}
