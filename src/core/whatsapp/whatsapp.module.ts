import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppSessionFactory } from './whatsapp-session.factory';

@Module({
  imports: [],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppSessionFactory],
})
export class WhatsAppModule { }
