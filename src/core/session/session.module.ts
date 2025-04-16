import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthStateModule } from './infrastructure/auth-state/auth-state.module';
import { EventStoreModule } from './infrastructure/event-store/event-store.module';

import * as CreateSession from './use-cases/create-session';
import * as CloseSession from './use-cases/close-session';
import * as OpenSession from './use-cases/open-session';
import * as RestartSession from './use-cases/restart-session';
import * as UpdateSessionCreds from './use-cases/update-session-creds';
import * as RegisterSessionQrCode from './use-cases/register-session-qr-code';

import { WhatsAppService } from './infrastructure/whatsapp/whatsapp.service';
import { WhatsAppEventsListener } from './infrastructure/whatsapp/whatsapp-event.listener';
import { SessionController } from './session.controller';

@Module({
  imports: [
    CqrsModule,
    EventEmitterModule.forRoot(),
    AuthStateModule,
    EventStoreModule,
  ],
  controllers: [SessionController],
  providers: [
    WhatsAppService,
    WhatsAppEventsListener,
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
  exports: []
})
export class SessionModule { }
