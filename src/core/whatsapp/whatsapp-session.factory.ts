import { Injectable } from '@nestjs/common';
import { makeWASocket, WASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppSessionFactory {
  // Método para inicializar a sessão e retornar o socket
  async initialize(sessionId: string, qrCodeSubject: Subject<string>): Promise<WASocket> {
    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${sessionId}`);

    // Cria o socket
    const socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      qrTimeout: 20000,
    });

    // Salvando credenciais ao serem atualizadas
    socket.ev.on('creds.update', () => {
      saveCreds();
    });

    // Monitorando os eventos de conexão
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Tratando a desconexão
      if (connection === 'close') {
        const disconnectError = lastDisconnect?.error as Boom;
        const statusCode = disconnectError?.output?.statusCode;
        console.log(`Conexão encerrada com erro: ${disconnectError.message}`);

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`Erro: ${statusCode}, reconectando: ${shouldReconnect}`);

        if (shouldReconnect) {
          await this.initialize(sessionId, qrCodeSubject);
        }
      }

      // Quando a conexão é estabelecida
      if (connection === 'open') {
        console.log('Conexão estabelecida com sucesso.');
      }

      // Emite o QR code para o fluxo
      if (qr) {
        qrCodeSubject.next(qr); // Emite o QR code para o Subject
      }
    });

    return socket;
  }
}
