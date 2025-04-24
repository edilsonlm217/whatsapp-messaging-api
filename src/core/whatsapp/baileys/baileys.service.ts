import { Injectable } from '@nestjs/common';
import { AuthenticationState, ConnectionState, DisconnectReason, makeWASocket, WASocket } from '@whiskeysockets/baileys';
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
    this.handleCredsUpdate(sessionId, socket, state);
    this.handleConnectionUpdate(sessionId, socket);
    return socket;
  }

  private handleCredsUpdate(sessionId: string, socket: WASocket, state: AuthenticationState) {
    socket.ev.on('creds.update', async (update) => {
      // Aqui você pode acessar o estado completo, atualizado
      await this.baileysEventsStore.append({
        sessionId: sessionId,
        type: BAILEYS_EVENTS.CREDS_UPDATED,
        aggregateId: sessionId,
        payload: state.creds, // <- acessando o creds atualizado direto da referência original
      });

      this.eventEmitter.emit('socket.creds.updated', {
        sessionId,
        update,
        creds: state.creds,
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

      if (update.qr) { this.handleQRCodeGenerated(sessionId, update.qr) }
      if (update.connection === 'close') { this.handleConnectionClosed(sessionId, update) }
      if (update.connection === 'open') { this.handleConnectionOpened(sessionId) }
    });
  }

  private handleQRCodeGenerated(sessionId: string, qrCode: string) {
    this.eventEmitter.emit('socket.qrcode.generated', {
      sessionId,
      qrCode,
    });
  }

  private handleConnectionClosed(sessionId: string, update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;

    this.eventEmitter.emit('socket.connection.closed', {
      sessionId,
      reason: restartRequired ? 'unexpected' : 'logout',
    });
  }

  private handleConnectionOpened(sessionId: string) {
    this.eventEmitter.emit('socket.connection.opened', {
      sessionId,
    });
  }
}
