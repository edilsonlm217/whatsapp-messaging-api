import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { SessionService } from './session.service';
import { SessionStateModule } from './session-state/session-state.module';
import { SessionMonitorModule } from './session-monitor/session-monitor.module';

@Module({
  imports: [AuthStateModule, SessionStateModule, SessionMonitorModule],
  controllers: [],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
