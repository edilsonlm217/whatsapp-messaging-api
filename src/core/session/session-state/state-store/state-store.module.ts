import { Module } from '@nestjs/common';
import { StateRepository } from './repositories/state.repository';
import { StateStoreService } from './state-store.service';

@Module({
  imports: [],
  controllers: [],
  providers: [StateStoreService, StateRepository],
  exports: [StateStoreService]
})
export class StateStoreModule { }
