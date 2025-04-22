import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly sessionService: SessionService
  ) { }

  // Esse método será chamado quando o evento 'session.created' for emitido
  @OnEvent('session.created')
  async handleSessionCreated(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Created):', payload);
      await this.whatsAppService.create(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.qrcode.generated' for emitido
  @OnEvent('socket.qrcode.generated')
  async handleQRCodeGenerated(payload: { sessionId: string; qrCode: string }) {
    try {
      console.log('Evento recebido no IntegrationService (QRCode Generated):', payload);
      await this.sessionService.registerQRCode(payload.sessionId, payload.qrCode);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.connection.closed' for emitido
  @OnEvent('socket.connection.closed')
  async handleConnectionClosed(payload: { sessionId: string; reason: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Connection Closed):', payload);
      await this.sessionService.closeSession(payload.sessionId, payload.reason);
    } catch (error) {
      console.error(error);
    }
  }
}
