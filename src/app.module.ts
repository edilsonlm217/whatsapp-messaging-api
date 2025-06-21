import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoModule } from './database/mongo/mongo.module';
import { SessionModule } from './core/session/session.module';
import { EventIndexingModule } from './infrastructure/event-indexing/event-indexing.module';
import { StructuredEventEmitterModule } from './infrastructure/structured-event-emitter/structured-event-emitter.module';
import { MessageModule } from './core/message/message.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MongoModule,
    SessionModule,
    MessageModule,
    StructuredEventEmitterModule,
    EventIndexingModule,
    DashboardModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
