import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticationCreds } from '@whiskeysockets/baileys';

import { OpenSessionCommand } from '../../commands/open-session/open-session.command';
import { CloseSessionCommand } from '../../use-cases/close-session/close-session.command';
import { UpdateSessionCredsCommand } from '../../commands/update-session-creds/update-session-creds.command';
import { RegisterSessionQRCodeCommand } from '../../commands/register-session-qr-code/register-session-qr-code.command';

@Injectable()
export class WhatsAppEventsListener {
  constructor(private readonly commandBus: CommandBus) { }

  @OnEvent('socket.qr')
  async handleQrCodeEvent(payload: { sessionId: string; qrCode: string }) {
    console.log(`QR code gerado para a sessão ${payload.sessionId}`);
    await this.commandBus.execute(new RegisterSessionQRCodeCommand(
      payload.sessionId,
      payload.qrCode
    ));
  }

  @OnEvent('socket.open')
  async handleConnectionOpen(payload: { sessionId: string }) {
    await this.commandBus.execute(new OpenSessionCommand(payload.sessionId));
  }

  @OnEvent('socket.close.unexpected')
  async handleUnexpectedClose(payload: { sessionId: string }) {
    const reason = 'Closed unexpectedly';
    await this.commandBus.execute(new CloseSessionCommand(
      payload.sessionId,
      reason
    ));
  }

  @OnEvent('socket.close.logout')
  async handleLogout(payload: { sessionId: string }) {
    const reason = 'Closed by logout';
    await this.commandBus.execute(new CloseSessionCommand(
      payload.sessionId,
      reason
    ));
  }

  @OnEvent('socket.creds.update')
  async handleCredsUpdate(payload: { sessionId: string; phone: string, phonePlatform: string, creds: AuthenticationCreds }) {
    console.log(`Credenciais atualizadas para a sessão ${payload.sessionId}.`);
    await this.commandBus.execute(new UpdateSessionCredsCommand(
      payload.sessionId,
      payload.phone,
      payload.phonePlatform,
      payload.creds
    ));
  }
}
