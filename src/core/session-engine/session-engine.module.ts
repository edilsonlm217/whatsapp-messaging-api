import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsAppService } from './infrastructure/whatsapp/whatsapp.service';
import { WhatsAppEventsListener } from './infrastructure/whatsapp/whatsapp-event.listener';
import { AuthStateModule } from '../auth-state/auth-state.module';
import { SessionEngineController } from './session-engine.controller';
import { SessionCreatedHandler } from './events/session-created/session-created-handler';
import { EventStoreModule } from './infrastructure/event-store/event-store.module';
import { CreateSessionHandler } from './commands/create-session/create-session.handler';
import { RegisterSessionQRCodeHandler } from './commands/register-session-qr-code/register-session-qr-code.handler';
import { QRCodeRegisteredHandler } from './events/qr-code-registered/qr-code-registered.handler';
import { CloseSessionHandler } from './commands/close-session/close-session.handler';
import { SessionClosedHandler } from './events/session-closed/session-closed.handler';
import { OpenSessionHandler } from './commands/open-session/open-session.handler';
import { SessionOpenedHandler } from './events/session-opened/session-opened.handler';
import { UpdateSessionCredsHandler } from './commands/update-session-creds/update-session-creds.handler';
import { SessionCredsUpdatedHandler } from './events/session-creds-updated/session-creds-updated.handler';

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
    CloseSessionHandler,
    SessionClosedHandler,
    CreateSessionHandler,
    SessionCreatedHandler,
    OpenSessionHandler,
    SessionOpenedHandler,
    RegisterSessionQRCodeHandler,
    QRCodeRegisteredHandler,
    UpdateSessionCredsHandler,
    SessionCredsUpdatedHandler
  ],
  exports: []
})
export class SessionEngineModule { }
