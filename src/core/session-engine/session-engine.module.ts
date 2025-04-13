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
    CreateSessionHandler,
    SessionCreatedHandler,
  ],
  exports: []
})
export class SessionEngineModule { }
