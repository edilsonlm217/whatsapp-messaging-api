import { Module } from '@nestjs/common';
import { SessionStateService } from './session-state.service';
import { StateMonitorService } from './services/state-monitor.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SessionStateService, StateMonitorService],
  exports: [SessionStateService]
})
export class SessionStateModule { }
