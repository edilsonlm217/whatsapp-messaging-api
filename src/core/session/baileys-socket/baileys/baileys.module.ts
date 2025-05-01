import { Module } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { EventInterpreterModule } from './event-interpreter/event-interpreter.module';

@Module({
  imports: [EventInterpreterModule],
  controllers: [],
  providers: [BaileysService],
  exports: [BaileysService]
})
export class BaileysModule { }
