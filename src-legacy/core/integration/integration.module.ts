import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [WhatsAppModule, SessionModule],
  controllers: [],
  providers: [IntegrationService],
})
export class IntegrationModule { }
