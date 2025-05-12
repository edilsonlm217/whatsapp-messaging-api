import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WAMessageUpdate } from '@whiskeysockets/baileys';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { MessageService } from './message.service';

@Injectable()
export class MessageUpdateListener {
  constructor(private readonly messageService: MessageService) { }

  @OnEvent('MessageUpdate', { async: true })
  async handleMessageUpdate(event: StructuredEvent<WAMessageUpdate>) {
    const messageUpdate = event.payload;
    if (!messageUpdate.key.id || !messageUpdate.update.status) {
      return;
    }
    await this.messageService.updateMessageStatus(messageUpdate.key.id, messageUpdate.update.status);
  }
}
