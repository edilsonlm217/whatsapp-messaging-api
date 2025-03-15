import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsAppModule } from './core/whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
