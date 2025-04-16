import { Global, Module } from '@nestjs/common';
import { EventStoreModule } from './event-store/event-store.module';
import { MongoModule } from './mongo/mongo.module';

@Global()
@Module({
  imports: [EventStoreModule, MongoModule],
  exports: [EventStoreModule, MongoModule],
})
export class DatabaseModule { }
