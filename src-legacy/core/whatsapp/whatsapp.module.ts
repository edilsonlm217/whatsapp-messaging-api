import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { AuthStateModule } from './auth-state/auth-state.module';
import { BaileysModule } from './baileys/baileys.module';
import { SocketManagerModule } from './socket-manager/socket-manager.module';

@Module({
  imports: [AuthStateModule, BaileysModule, SocketManagerModule],
  controllers: [],
  providers: [WhatsAppService],
  exports: [WhatsAppService]
})
export class WhatsAppModule { }
