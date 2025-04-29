import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { BaileysModule } from './baileys/baileys.module';
import { SocketManagerModule } from './socket-manager/socket-manager.module';
import { BaileysSocketService } from './baileys-socket.service';

@Module({
  imports: [AuthStateModule, BaileysModule, SocketManagerModule],
  controllers: [],
  providers: [BaileysSocketService],
  exports: [BaileysSocketService]
})
export class BaileysSocketModule { }
