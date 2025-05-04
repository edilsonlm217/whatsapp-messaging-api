import { Module } from '@nestjs/common';
import { BaileysSocketModule } from '../baileys-socket/baileys-socket.module';
import { SessionStateModule } from '../session-state/session-state.module';
import { SocketSessionSyncService } from './socket-session-sync.service';
import { InconsistentStateEmitterService } from './services/inconsistent-state-emitter.service';
import { StructuredEventEmitterModule } from 'src/infrastructure/structured-event-emitter/structured-event-emitter.module';

@Module({
  imports: [BaileysSocketModule, SessionStateModule, StructuredEventEmitterModule],
  controllers: [],
  providers: [SocketSessionSyncService, InconsistentStateEmitterService],
})
export class SocketSessionSyncModule { }
