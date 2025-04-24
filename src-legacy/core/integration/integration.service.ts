import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SessionService } from '../session/session.service';
import { AuthenticationCreds } from '@whiskeysockets/baileys';

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

  @OnEvent('session.logged-out')
  async handleSessionLoggedOut(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Logged Out):', payload);
      await this.whatsAppService.logout(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('session.restart-required')
  async handleRestartRequired(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Restart Required):', payload);
      this.sessionService.restartSession(payload.sessionId);
      await this.whatsAppService.restart(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('session.closed')
  async handleSessionClosed(payload: { sessionId: string; reason: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Closed):', payload);
      await this.whatsAppService.delete(payload.sessionId);
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
      if (payload.reason === 'logout') await this.whatsAppService.delete(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.connection.opened' for emitido
  @OnEvent('socket.connection.opened')
  async handleConnectionOpened(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Connection Opened):', payload);
      await this.sessionService.openSession(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('socket.creds.updated')
  async handleCredsUpdated(payload: { sessionId: string, update: Partial<AuthenticationCreds>, creds: AuthenticationCreds }) {
    try {
      console.log('Evento recebido no IntegrationService (Creds Updated):', payload);
      // Aqui você pode fazer algo com as credenciais atualizadas
      const phone = payload.update.me?.id!;
      const phonePlatform = payload.update.platform!;
      await this.sessionService.updateCreds(payload.sessionId, phone, phonePlatform);
      await this.whatsAppService.saveCreds(payload.sessionId, payload.creds);
    } catch (error) {
      console.error(error);
    }
  }
}
