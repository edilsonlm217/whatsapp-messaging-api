import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { SessionManager } from './session.manager.service';

@Module({
  imports: [AuthStateModule],
  controllers: [],
  providers: [SessionManager],
  exports: [SessionManager]
})
export class SessionManagerModule { }
