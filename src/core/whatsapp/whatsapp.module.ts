import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [AuthStateModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService]
})
export class WhatsAppModule { }
