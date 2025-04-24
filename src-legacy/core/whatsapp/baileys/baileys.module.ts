import { Module } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { BaileysEventsStore } from './store/baileys-events.store';

@Module({
  imports: [],
  controllers: [],
  providers: [BaileysService, BaileysEventsStore],
  exports: [BaileysService, BaileysEventsStore]
})
export class BaileysModule { }
