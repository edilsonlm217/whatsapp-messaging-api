import { Module } from '@nestjs/common';
import { StateManagerService } from './state-manager.service';

@Module({
  imports: [],
  controllers: [],
  providers: [StateManagerService],
  exports: [StateManagerService]
})
export class StateManagerModule { }
