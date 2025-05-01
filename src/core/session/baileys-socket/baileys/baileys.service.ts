import { Injectable } from '@nestjs/common';
import { AuthenticationCreds, AuthenticationState, ConnectionState, makeWASocket, WASocket } from '@whiskeysockets/baileys';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';

@Injectable()
export class BaileysService {
  constructor(private readonly eventEmitterService: EventEmitterService) { }

  createSocket(sessionId: string, state: AuthenticationState): WASocket {
    const socket = makeWASocket({ auth: state, printQRInTerminal: true });

    socket.ev.on('connection.update', (update) => {
      this.eventEmitterService.emitEvent<Partial<ConnectionState>>(
        sessionId,
        'ConnectionUpdate',
        'baileys-socket',
        BaileysService.name,
        update
      );
    });

    socket.ev.on('creds.update', () => {
      this.eventEmitterService.emitEvent<AuthenticationCreds>(
        sessionId,
        'CredsUpdate',
        'baileys-socket',
        BaileysService.name,
        socket.authState.creds
      );
    });

    return socket;
  }
}
