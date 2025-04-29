import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Boom } from '@hapi/boom';
import { DisconnectReason, ConnectionState, AuthenticationCreds } from '@whiskeysockets/baileys';

@Injectable()
export class EventInterpreterService {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  @OnEvent('baileys.connection.update')
  handleConnectionUpdate(payload: { sessionId: string, update: Partial<ConnectionState> }) {
    const { sessionId, update } = payload;

    if (update.qr) {
      this.eventEmitter.emit('socket.qrcode.generated', { sessionId, qrCode: update.qr });
    }

    if (update.connection === 'open') {
      this.eventEmitter.emit('socket.connection.opened', { sessionId });
    }

    if (update.connection === 'close') {
      const error = update.lastDisconnect?.error as Boom;
      const statusCode = error?.output?.statusCode;
      const restartRequired = statusCode === DisconnectReason.restartRequired;

      if (restartRequired) {
        this.eventEmitter.emit('socket.connection.closed', { sessionId });
      } else {
        this.eventEmitter.emit('socket.connection.logged-out', { sessionId });
      }
    }
  }

  @OnEvent('baileys.creds.update')
  handleCredsUpdate(payload: { sessionId: string, update: Partial<AuthenticationCreds>, creds: AuthenticationCreds }) {
    const { sessionId, update, creds } = payload;
    const phone = creds.me?.id;
    const phonePlatform = creds.platform;
    this.eventEmitter.emit('socket.creds.updated', { sessionId, phone, phonePlatform, creds });
  }
}
