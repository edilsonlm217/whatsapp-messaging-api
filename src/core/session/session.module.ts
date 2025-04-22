import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';

import * as CreateSession from './use-cases/create-session';
import * as CloseSession from './use-cases/close-session';
import * as OpenSession from './use-cases/open-session';
import * as RestartSession from './use-cases/restart-session';
import * as UpdateSessionCreds from './use-cases/update-session-creds';
import * as RegisterSessionQrCode from './use-cases/register-session-qr-code';
import { SessionEventsStore } from './infrastructure/session-event-store/session-events.store';

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionEventsStore,
    CloseSession.CloseSessionHandler,
    CloseSession.SessionClosedHandler,
    CreateSession.CreateSessionHandler,
    CreateSession.SessionCreatedHandler,
    OpenSession.OpenSessionHandler,
    OpenSession.SessionOpenedHandler,
    RestartSession.SessionRestartedHandler,
    RestartSession.RestartSessionHandler,
    UpdateSessionCreds.UpdateSessionCredsHandler,
    UpdateSessionCreds.SessionCredsUpdatedHandler,
    RegisterSessionQrCode.RegisterSessionQRCodeHandler,
    RegisterSessionQrCode.QRCodeRegisteredHandler,
  ],
  exports: [SessionService]
})
export class SessionModule { }
