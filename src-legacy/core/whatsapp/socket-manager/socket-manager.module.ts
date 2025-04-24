import { Module } from '@nestjs/common';
import { SocketManagerService } from './socket-manager.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketManagerService],
  exports: [SocketManagerService]
})
export class SocketManagerModule { }
