import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { BaileysSocketModule } from '../session/baileys-socket/baileys-socket.module';
import { MessageController } from './message.controller';
import { SessionStateModule } from '../session/session-state/session-state.module';
import { MessageRepository } from './message.repository';
import { MessageUpdateListener } from './message-update.listener';
import { EventIndexingModule } from 'src/infrastructure/event-indexing/event-indexing.module';

@Module({
  imports: [BaileysSocketModule, SessionStateModule, EventIndexingModule],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageUpdateListener],
  exports: [MessageService]
})
export class MessageModule { }
