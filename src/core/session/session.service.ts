import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticationCreds } from '@whiskeysockets/baileys';

import { CreateSessionCommand } from './use-cases/create-session';
import { OpenSessionCommand } from './use-cases/open-session';
import { CloseSessionCommand } from './use-cases/close-session';
import { RegisterSessionQRCodeCommand } from './use-cases/register-session-qr-code';
import { RestartSessionCommand } from './use-cases/restart-session';
import { UpdateSessionCredsCommand } from './use-cases/update-session-creds';
import { SessionEventsStore } from './infrastructure/session-event-store/session-events.store';

@Injectable()
export class SessionService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly sessionEventsStore: SessionEventsStore,
  ) { }

  async createSession(sessionId: string) {
    await this.commandBus.execute(new CreateSessionCommand(sessionId));
    return { message: 'Session created!' };
  }

  async openSession(sessionId: string) {
    await this.commandBus.execute(new OpenSessionCommand(sessionId));
    return { message: 'Session opened!' };
  }

  async closeSession(sessionId: string, reason: string) {
    await this.commandBus.execute(new CloseSessionCommand(sessionId, reason));
    return { message: 'Session closed!' };
  }

  async registerQRCode(sessionId: string, qrCode: string) {
    await this.commandBus.execute(new RegisterSessionQRCodeCommand(sessionId, qrCode));
    return { message: 'QR Code registered!' };
  }

  async restartSession(sessionId: string) {
    await this.commandBus.execute(new RestartSessionCommand(sessionId));
    return { message: 'Session restarted!' };
  }

  async updateCreds(sessionId: string, phone: string, phonePlatform: string, creds: AuthenticationCreds) {
    await this.commandBus.execute(new UpdateSessionCredsCommand(sessionId, phone, phonePlatform, creds));
    return { message: 'Session credentials updated!' };
  }

  getCategoryStream() {
    return this.sessionEventsStore.getCategoryStream();
  }
}
