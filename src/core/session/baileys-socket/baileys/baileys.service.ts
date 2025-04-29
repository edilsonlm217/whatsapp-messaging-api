import { Injectable } from '@nestjs/common';
import { AuthenticationState, makeWASocket, WASocket } from '@whiskeysockets/baileys';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BaileysService {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  createSocket(sessionId: string, state: AuthenticationState): WASocket {
    const socket = makeWASocket({ auth: state, printQRInTerminal: true });

    socket.ev.on('connection.update', (update) => {
      this.eventEmitter.emit('baileys.connection.update', { sessionId, update });
    });

    socket.ev.on('creds.update', (update) => {
      this.eventEmitter.emit('baileys.creds.update', { sessionId, update, creds: state.creds });
    });

    return socket;
  }
}
