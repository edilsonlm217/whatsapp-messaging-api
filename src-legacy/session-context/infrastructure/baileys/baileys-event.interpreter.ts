import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Boom } from '@hapi/boom';
import { DisconnectReason, ConnectionState, AuthenticationCreds } from '@whiskeysockets/baileys';

@Injectable()
export class BaileysEventInterpreter {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  @OnEvent('baileys.connection.update')
  handleConnectionUpdate(payload: { sessionId: string, update: Partial<ConnectionState> }) {
    const { sessionId, update } = payload;

    if (update.qr) { this.handleQRCodeGenerated(sessionId, update.qr) }
    if (update.connection === 'open') { this.handleConnectionOpened(sessionId) }
    if (update.connection === 'close') { this.handleConnectionClosed(sessionId, update) }
  }

  // Funções auxiliares para manipulação dos eventos
  private handleQRCodeGenerated(sessionId: string, qrCode: string) {
    console.log(`QR Code gerado para a sessão ${sessionId}: ${qrCode}`);
    this.eventEmitter.emit('socket.qrcode.generated', { sessionId, qrCode });
  }

  private handleConnectionOpened(sessionId: string) {
    console.log(`Conexão aberta para a sessão ${sessionId}`);
    this.eventEmitter.emit('socket.connection.opened', { sessionId });
  }

  private handleConnectionClosed(sessionId: string, update: Partial<ConnectionState>) {
    const error = update.lastDisconnect?.error as Boom;
    const statusCode = error?.output?.statusCode;
    const restartRequired = statusCode === DisconnectReason.restartRequired;
    const reason = restartRequired ? 'unexpected' : 'logout';

    console.log(`Conexão fechada para a sessão ${sessionId}, motivo: ${reason}`);
    this.eventEmitter.emit('socket.connection.closed', { sessionId, reason });
  }

  @OnEvent('baileys.creds.update')
  handleCredsUpdate(payload: { sessionId: string, update: AuthenticationCreds }) {
    const { sessionId, update } = payload;
    // Ações específicas para quando as credenciais forem atualizadas
    this.handleCredsUpdated(sessionId, update);
  }

  private handleCredsUpdated(sessionId: string, update: Partial<AuthenticationCreds>) {
    console.log(`Credenciais atualizadas para a sessão ${sessionId}`);
    this.eventEmitter.emit('socket.creds.updated', { sessionId, update });
  }
}
