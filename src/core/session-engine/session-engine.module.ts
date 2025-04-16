import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsAppService } from './infrastructure/whatsapp/whatsapp.service';
import { WhatsAppEventsListener } from './infrastructure/whatsapp/whatsapp-event.listener';
import { AuthStateModule } from '../auth-state/auth-state.module';
import { SessionEngineController } from './session-engine.controller';
import { EventStoreModule } from './infrastructure/event-store/event-store.module';
import { RegisterSessionQRCodeHandler } from './commands/register-session-qr-code/register-session-qr-code.handler';
import { QRCodeRegisteredHandler } from './events/qr-code-registered/qr-code-registered.handler';
import { UpdateSessionCredsHandler } from './commands/update-session-creds/update-session-creds.handler';
import { SessionCredsUpdatedHandler } from './events/session-creds-updated/session-creds-updated.handler';
import * as CreateSession from './use-cases/create-session';
import * as CloseSession from './use-cases/close-session';
import * as OpenSession from './use-cases/open-session';
import * as RestartSession from './use-cases/restart-session';

@Module({
  imports: [
    CqrsModule,
    EventEmitterModule.forRoot(),
    AuthStateModule,
    EventStoreModule,
  ],
  controllers: [SessionEngineController],
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
    RegisterSessionQRCodeHandler,
    QRCodeRegisteredHandler,
    UpdateSessionCredsHandler,
    SessionCredsUpdatedHandler,
  ],
  exports: []
})
export class SessionEngineModule { }
