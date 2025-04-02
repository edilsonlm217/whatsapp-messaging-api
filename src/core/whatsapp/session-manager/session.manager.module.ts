import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { SessionManager } from './session.manager.service';
import { SessionRepository } from './session.repository';

@Module({
  imports: [AuthStateModule],
  controllers: [],
  providers: [SessionManager, SessionRepository],
  exports: [SessionManager]
})
export class SessionManagerModule { }
