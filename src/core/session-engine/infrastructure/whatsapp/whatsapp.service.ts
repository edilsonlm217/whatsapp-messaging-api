import { Injectable } from '@nestjs/common';
import { AuthenticationState, DisconnectReason, makeWASocket, WASocket } from '@whiskeysockets/baileys';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Boom } from '@hapi/boom';

@Injectable()
export class WhatsAppService {
  // Armazenando o estado do socket por sessionId
  private sockets: Map<string, WASocket> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) { }

  // Cria o socket e armazena seu estado
  createSocket(sessionId: string, state: AuthenticationState) {
    // Verifica se já existe um socket para a sessão
    if (this.sockets.has(sessionId)) {
      return; // Já existe um socket para esse sessionId  
    }

    // Criação do socket
    const socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      qrTimeout: 20000,
    });

    socket.ev.on('creds.update', async () => {
      this.eventEmitter.emit('socket.creds.update', { sessionId, creds: state.creds });
    });

    // Lida com eventos de atualização da conexão
    socket.ev.on('connection.update', (update) => {
      if (update.qr) {
        this.eventEmitter.emit('socket.qr', { sessionId, qrCode: update.qr });
      }

      if (update.connection === 'open') {
        this.eventEmitter.emit('socket.open', { sessionId });
      }

      if (update.connection === 'close') {
        const error = update.lastDisconnect?.error as Boom;
        const statusCode = error?.output?.statusCode;
        const restartRequired = statusCode === DisconnectReason.restartRequired;

        if (restartRequired) {
          this.eventEmitter.emit('socket.close.unexpected', { sessionId });
        } else {
          this.eventEmitter.emit('socket.close.logout', { sessionId });
        }
      }
    });

    // Armazenando o socket
    this.sockets.set(sessionId, socket);
  }

  // Recupera o socket pelo sessionId
  getSocket(sessionId: string): WASocket | undefined {
    return this.sockets.get(sessionId);
  }

  // Remove o socket do estado
  removeSocket(sessionId: string): void {
    this.sockets.delete(sessionId);
  }
}
