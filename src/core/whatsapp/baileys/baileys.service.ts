import { Injectable } from '@nestjs/common';
import { AuthenticationState, makeWASocket, WASocket } from '@whiskeysockets/baileys';
import { BaileysEventsStore } from './store/baileys-events.store';
import { BAILEYS_EVENTS } from './events';

@Injectable()
export class BaileysService {
  constructor(private readonly baileysEventsStore: BaileysEventsStore) { }

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
    });
  }
}
