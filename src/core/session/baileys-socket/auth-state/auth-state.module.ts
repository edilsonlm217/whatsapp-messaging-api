import { Module } from '@nestjs/common';
import { AuthStateService } from './auth-state.service';
import { CredsService } from './services/creds.service';
import { KeysService } from './services/keys.service';
import { KeysRepository } from './repositories/keys.repository';
import { CredsRepository } from './repositories/creds.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AuthStateService,
    CredsService,
    KeysService,
    CredsRepository,
    KeysRepository
  ],
  exports: [AuthStateService]
})
export class AuthStateModule { }
