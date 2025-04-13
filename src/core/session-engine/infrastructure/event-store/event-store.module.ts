import { Module } from '@nestjs/common';
import { EventStoreService } from './event-store.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventStoreService],
  exports: [EventStoreService]
})
export class EventStoreModule { }
