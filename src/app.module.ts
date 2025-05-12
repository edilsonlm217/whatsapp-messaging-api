import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoModule } from './database/mongo/mongo.module';
import { SessionModule } from './core/session/session.module';
import { EventIndexingModule } from './infrastructure/event-indexing/event-indexing.module';
import { StructuredEventEmitterModule } from './infrastructure/structured-event-emitter/structured-event-emitter.module';
import { MessageModule } from './core/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    EventEmitterModule.forRoot(),
    MongoModule,
    SessionModule,
    MessageModule,
    StructuredEventEmitterModule,
    EventIndexingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
