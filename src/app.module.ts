import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionModule } from './core/session/session.module';
import { DatabaseModule } from './database/database.module';
import { WhatsAppModule } from './core/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    SessionModule,
    WhatsAppModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
