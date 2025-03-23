import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { SessionManagerModule } from './session-manager/session.manager.module';

@Module({
  imports: [SessionManagerModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService]
})
export class WhatsAppModule { }
