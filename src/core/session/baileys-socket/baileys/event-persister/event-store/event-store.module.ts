import { Module } from '@nestjs/common';
import { EventsStoreService } from './event-store.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsStoreService],
  exports: [EventsStoreService]
})
export class EventStoreModule { }
