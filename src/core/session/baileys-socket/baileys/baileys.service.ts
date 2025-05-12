import { Injectable } from '@nestjs/common';
import { AuthenticationCreds, AuthenticationState, ConnectionState, makeWASocket, WASocket, WAMessageUpdate } from '@whiskeysockets/baileys';
import { EventEmitterService } from 'src/infrastructure/structured-event-emitter/event.emitter.service';

@Injectable()
export class BaileysService {
  constructor(private readonly eventEmitterService: EventEmitterService) { }

  createSocket(sessionId: string, state: AuthenticationState): WASocket {
    const socket = makeWASocket({ auth: state, printQRInTerminal: true });

    // Evento de conexão
    socket.ev.on('connection.update', (update) => {
      this.eventEmitterService.emitEvent<Partial<ConnectionState>>(
        sessionId,
        'ConnectionUpdate',
        'baileys-socket',
        BaileysService.name,
        update
      );
    });

    // Evento de atualização das credenciais
    socket.ev.on('creds.update', () => {
      this.eventEmitterService.emitEvent<AuthenticationCreds>(
        sessionId,
        'CredsUpdate',
        'baileys-socket',
        BaileysService.name,
        socket.authState.creds
      );
    });

    // Captura de atualizações de status das mensagens (entrega, leitura, erro)
    socket.ev.on('messages.update', (messageUpdates: WAMessageUpdate[]) => {
      for (const { update, key } of messageUpdates) {
        if (!key.id || !key.remoteJid) { continue }

        const PRIMARY_DEVICE_REGEX = /^\d+@s\.whatsapp\.net$/;
        const isPrimaryDeviceJid = PRIMARY_DEVICE_REGEX.test(key.remoteJid);
        if (!isPrimaryDeviceJid) { continue }

        this.eventEmitterService.emitEvent<WAMessageUpdate>(
          sessionId,
          'MessageUpdate',
          'baileys-socket',
          BaileysService.name,
          {
            update,
            key
          }
        );
      }
    });

    return socket;
  }
}
