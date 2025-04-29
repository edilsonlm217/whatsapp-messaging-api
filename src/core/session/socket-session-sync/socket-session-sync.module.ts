import { Module } from '@nestjs/common';
import { BaileysSocketModule } from '../baileys-socket/baileys-socket.module';
import { SessionStateModule } from '../session-state/session-state.module';
import { SocketSessionSyncService } from './socket-session-sync.service';

@Module({
  imports: [BaileysSocketModule, SessionStateModule],
  controllers: [],
  providers: [SocketSessionSyncService],
})
export class SocketSessionSyncModule { }
