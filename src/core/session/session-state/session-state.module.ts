import { Module } from '@nestjs/common';
import { SessionStateService } from './session-state.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SessionStateService],
  exports: [SessionStateService]
})
export class SessionStateModule { }
