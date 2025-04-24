
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticationCreds } from '@whiskeysockets/baileys';
import { BaileysSocketService } from './baileys-socket.service';
import { SessionCommandService } from './session-command.service';

@Injectable()
export class SessionOrchestratorService {
  constructor(
    private readonly baileysSocketService: BaileysSocketService,
    private readonly sessionCommandService: SessionCommandService,
  ) { }

  // Esse método será chamado quando o evento 'session.created' for emitido
  @OnEvent('session.created')
  async handleSessionCreated(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Created):', payload);
      await this.baileysSocketService.create(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('session.logged-out')
  async handleSessionLoggedOut(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Logged Out):', payload);
      await this.baileysSocketService.logout(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('session.restart-required')
  async handleRestartRequired(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Restart Required):', payload);
      this.sessionCommandService.restartSession(payload.sessionId);
      await this.baileysSocketService.restart(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('session.closed')
  async handleSessionClosed(payload: { sessionId: string; reason: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Session Closed):', payload);
      await this.baileysSocketService.delete(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.qrcode.generated' for emitido
  @OnEvent('socket.qrcode.generated')
  async handleQRCodeGenerated(payload: { sessionId: string; qrCode: string }) {
    try {
      console.log('Evento recebido no IntegrationService (QRCode Generated):', payload);
      await this.sessionCommandService.registerQRCode(payload.sessionId, payload.qrCode);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.connection.closed' for emitido
  @OnEvent('socket.connection.closed')
  async handleConnectionClosed(payload: { sessionId: string; reason: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Connection Closed):', payload);
      await this.sessionCommandService.closeSession(payload.sessionId, payload.reason);
      if (payload.reason === 'logout') await this.baileysSocketService.delete(payload.sessionId);
    } catch (error) {
      console.error(error);
    }
  }

  // Esse método será chamado quando o evento 'socket.connection.opened' for emitido
  @OnEvent('socket.connection.opened')
  async handleConnectionOpened(payload: { sessionId: string }) {
    try {
      console.log('Evento recebido no IntegrationService (Connection Opened):', payload);
      await this.sessionCommandService.openSession(payload.sessionId);
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
      await this.sessionCommandService.updateCreds(payload.sessionId, phone, phonePlatform);
      await this.baileysSocketService.saveCreds(payload.sessionId, payload.creds);
    } catch (error) {
      console.error(error);
    }
  }
}
