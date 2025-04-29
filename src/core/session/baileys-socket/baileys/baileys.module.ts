import { Module } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { EventInterpreterModule } from './event-interpreter/event-interpreter.module';
import { EventPersisterModule } from './event-persister/event-persister.module';

@Module({
  imports: [EventInterpreterModule, EventPersisterModule],
  controllers: [],
  providers: [BaileysService],
  exports: [BaileysService]
})
export class BaileysModule { }
