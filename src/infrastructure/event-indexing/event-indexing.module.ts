import { Module } from '@nestjs/common';
import { EventIndexingService } from './event-indexing.service';
import { BaileysSocketListener } from './listeners/baileys-socket.listener';
import { SessionListener } from './listeners/session.listener';
import { SessionStateListener } from './listeners/session-state.listener';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { SentMessageListener } from './listeners/sent-message.listener';

@Module({
  imports: [ElasticsearchModule],
  providers: [
    EventIndexingService,
    BaileysSocketListener,
    SessionListener,
    SessionStateListener, 
    SentMessageListener],
  exports: [EventIndexingService],
})
export class EventIndexingModule { }
