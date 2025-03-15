import { Injectable } from '@nestjs/common';
import { makeWASocket, WASocket, useMultiFileAuthState, DisconnectReason, ConnectionState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppSessionFactory {
  private sockets = new Map<string, WASocket>();

  async initialize(sessionId: string, qrCodeSubject?: Subject<string>): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${sessionId}`);

    // Cria o socket
    const socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      qrTimeout: 20000,
    });

    const handleDesconnectionCallback = (update: Partial<ConnectionState>) => {
      if (update.connection === 'close') {
        console.log("update.connection === 'close'");
        // Tratando a desconexão
        const disconnectError = update.lastDisconnect?.error as Boom;
        const statusCode = disconnectError?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        this.sockets.delete(sessionId);
        if (shouldReconnect) {
          this.initialize(sessionId);
        }
      }
    }

    const handleConnectionCallback = (update: Partial<ConnectionState>) => {
      // Quando a conexão é estabelecida
      if (update.connection === 'open') {
        console.log("update.connection === 'open'");
        this.sockets.set(sessionId, socket);
        if (qrCodeSubject) {
          qrCodeSubject.next('Sessão iniciada com sucesso');
        }
      }
    }

    const handleQrCodeGenerationCallback = (update: Partial<ConnectionState>) => {
      if (update.qr) {
        if (qrCodeSubject) {
          qrCodeSubject.next(update.qr);
        }
      }
    }

    // Salvando credenciais ao serem atualizadas
    socket.ev.on('creds.update', () => saveCreds());
    socket.ev.on('connection.update', (update) => handleDesconnectionCallback(update));
    socket.ev.on('connection.update', (update) => handleConnectionCallback(update));
    if (qrCodeSubject) {
      socket.ev.on('connection.update', (update) => handleQrCodeGenerationCallback(update));
    }
  }
}
