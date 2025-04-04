import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { SessionService } from './session.service';
import { SessionStateModule } from './session-state/session-state.module';

@Module({
  imports: [AuthStateModule, SessionStateModule],
  controllers: [],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
