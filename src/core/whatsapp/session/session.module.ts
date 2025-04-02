import { Module } from '@nestjs/common';
import { AuthStateModule } from './auth-state/auth-state.module';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';

@Module({
  imports: [AuthStateModule],
  controllers: [],
  providers: [SessionService, SessionRepository],
  exports: [SessionService]
})
export class SessionModule { }
