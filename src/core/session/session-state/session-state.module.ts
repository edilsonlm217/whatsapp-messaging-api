import { Module } from '@nestjs/common';
import { SessionStateService } from './session-state.service';
import { StateManagerModule } from './state-manager/state-manager.module';

@Module({
  imports: [StateManagerModule],
  controllers: [],
  providers: [SessionStateService],
  exports: [SessionStateService]
})
export class SessionStateModule { }
