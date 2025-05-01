import { Global, Module } from '@nestjs/common';
import { EventEmitterService } from './event.emitter.service';

@Global()
@Module({
  imports: [],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class StructuredEventEmitterModule { }
