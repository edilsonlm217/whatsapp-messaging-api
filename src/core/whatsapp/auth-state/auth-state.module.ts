import { Module } from '@nestjs/common';
import { AuthStateService } from './auth-state.service';
import { CredsService } from './services/creds.service';
import { KeysService } from './services/keys.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthStateService, CredsService, KeysService],
  exports: [AuthStateService]
})
export class AuthStateModule { }
