import { Module } from '@nestjs/common';
import { EventIndexingService } from './event-indexing.service';
import { BaileysSocketListener } from './listeners/baileys-socket.listener';
import { SessionListener } from './listeners/session.listener';
import { SessionStateListener } from './listeners/session-state.listener';

@Module({
  imports: [],
  providers: [EventIndexingService, BaileysSocketListener, SessionListener, SessionStateListener],
  exports: [EventIndexingService],
})
export class EventIndexingModule { }
