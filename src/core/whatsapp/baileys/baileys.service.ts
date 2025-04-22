import { Injectable } from '@nestjs/common';
import { AuthenticationState, DisconnectReason, makeWASocket, WASocket } from '@whiskeysockets/baileys';
import { BaileysEventsStore } from './store/baileys-events.store';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BAILEYS_EVENTS } from './events';
import { Boom } from '@hapi/boom';

@Injectable()
export class BaileysService {
  constructor(
    private readonly baileysEventsStore: BaileysEventsStore,
    private readonly eventEmitter: EventEmitter2,  // Adicionando o EventEmitter2
  ) { }

  createSocket(sessionId: string, state: AuthenticationState): WASocket {
    const socket = makeWASocket({ printQRInTerminal: true, auth: state, qrTimeout: 20000 });
    this.handleCredsUpdate(sessionId, socket);
    this.handleConnectionUpdate(sessionId, socket);
    return socket;
  }

  private async handleCredsUpdate(sessionId: string, socket: WASocket) {
    socket.ev.on('creds.update', async (update) => {
      await this.baileysEventsStore.append({
        sessionId: sessionId,
        type: BAILEYS_EVENTS.CREDS_UPDATED,
        aggregateId: sessionId,
        payload: update,
      });
    });
  }

  private async handleConnectionUpdate(sessionId: string, socket: WASocket) {
    socket.ev.on('connection.update', async (update) => {
      await this.baileysEventsStore.append({
        sessionId: sessionId,
        type: BAILEYS_EVENTS.CONNECTION_UPDATED,
        aggregateId: sessionId,
        payload: update,
      });

      if (update.qr) {
        this.eventEmitter.emit('socket.qrcode.generated', {
          sessionId,
          qrCode: update.qr,
        });
      }

      if (update.connection === 'close') {
        const error = update.lastDisconnect?.error as Boom;
        const statusCode = error?.output?.statusCode;
        const restartRequired = statusCode === DisconnectReason.restartRequired;

        if (restartRequired) {
          // Emitir evento de desconexão com motivo de reinício requerido
          this.eventEmitter.emit('socket.connection.closed', {
            sessionId,
            reason: 'unexpected',  // Ou qualquer outra informação relevante
          });
        } else {
          // Emitir evento de desconexão com motivo de logout
          this.eventEmitter.emit('socket.connection.closed', {
            sessionId,
            reason: 'logout',  // Ou qualquer outra informação relevante
          });
        }
      }
    });
  }
}
