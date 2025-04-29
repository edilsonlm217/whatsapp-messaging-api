import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventStoreModule } from './database/event-store/event-store.module';
import { MongoModule } from './database/mongo/mongo.module';
import { SessionModule } from './core/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    EventEmitterModule.forRoot(),
    EventStoreModule,
    MongoModule,
    SessionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
