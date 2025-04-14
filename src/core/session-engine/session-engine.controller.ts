import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateSessionCommand } from "./commands/create-session/create-session.command";
import { OpenSessionCommand } from "./commands/open-session/open-session.command";
import { CloseSessionCommand } from "./commands/close-session/close-session.command";
import { RegisterSessionQRCodeCommand } from "./commands/register-session-qr-code/register-session-qr-code.command";
import { UpdateSessionCredsCommand } from "./commands/update-session-creds/update-session-creds.command";
import { AuthenticationCreds } from "@whiskeysockets/baileys";

@Controller('sessions')
export class SessionEngineController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post()
  async create(@Body() body: { sessionId: string }) {
    await this.commandBus.execute(new CreateSessionCommand(body.sessionId));
    return { message: 'Session created!' };
  }

  @Post('open')
  async open(@Body() body: { sessionId: string }) {
    await this.commandBus.execute(new OpenSessionCommand(body.sessionId));
    return { message: 'Session opened!' };
  }

  @Post('close')
  async close(@Body() body: { sessionId: string; reason?: string }) {
    await this.commandBus.execute(new CloseSessionCommand(
      body.sessionId,
      body.reason || 'Closed manually via endpoint',
    ));
    return { message: 'Session closed!' };
  }

  @Post('qr')
  async registerQrCode(@Body() body: { sessionId: string; qrCode: string }) {
    await this.commandBus.execute(new RegisterSessionQRCodeCommand(
      body.sessionId,
      body.qrCode,
    ));
    return { message: 'QR Code registered!' };
  }

  @Post('creds')
  async updateCreds(@Body() body: { sessionId: string; creds: AuthenticationCreds }) {
    await this.commandBus.execute(new UpdateSessionCredsCommand(
      body.sessionId,
      body.creds,
    ));
    return { message: 'Creds updated!' };
  }
}
