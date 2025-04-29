import { Module } from '@nestjs/common';
import { BaileysSocketModule } from './baileys-socket/baileys-socket.module';
import { SessionStateModule } from './session-state/session-state.module';
import { SocketSessionSyncModule } from './socket-session-sync/socket-session-sync.module';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [BaileysSocketModule, SessionStateModule, SocketSessionSyncModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
