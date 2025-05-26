import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { proto } from '@whiskeysockets/baileys';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { EventIndexingService } from '../event-indexing.service';

@Injectable()
export class SentMessageListener {
  constructor(private readonly indexingService: EventIndexingService) { }

  @OnEvent('MessageSent', { async: true })
  async onMessageSent(event: StructuredEvent<proto.WebMessageInfo>) {
    await this.indexingService.indexEvent('events-sent-messages', event);
  }
}
