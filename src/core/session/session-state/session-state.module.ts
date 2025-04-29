import { Module } from '@nestjs/common';
import { SessionStateService } from './session-state.service';
import { StateStoreModule } from './state-store/state-store.module';

@Module({
  imports: [StateStoreModule],
  controllers: [],
  providers: [SessionStateService],
  exports: [SessionStateService]
})
export class SessionStateModule { }
