import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { SessionManager } from './session.manager.service';

@Module({
  imports: [AuthStateModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, SessionManager],
  exports: [WhatsAppService]
})
export class WhatsAppModule { }
