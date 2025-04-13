import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { WhatsAppModule } from './core/whatsapp/whatsapp.module';
import { SessionEngineModule } from './core/session-engine/session-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    SessionEngineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
