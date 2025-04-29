import { Module } from '@nestjs/common';
import { EventInterpreterService } from './event-interpreter.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventInterpreterService],
  exports: [EventInterpreterService]
})
export class EventInterpreterModule { }
