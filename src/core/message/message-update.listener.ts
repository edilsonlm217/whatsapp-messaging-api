import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { MessageService } from './message.service';
import { EventIndexingService } from 'src/infrastructure/event-indexing/event-indexing.service';
import { MessageStatusMapper } from 'src/common/enums/utils/message-status-mapper';
import { WAMessageUpdate } from '@whiskeysockets/baileys';

@Injectable()
export class MessageUpdateListener {
  constructor(
    private readonly messageService: MessageService,
    private readonly indexingService: EventIndexingService,
  ) { }

  @OnEvent('MessageUpdate', { async: true })
  async handleupdate(event: StructuredEvent<WAMessageUpdate>) {
    const msgUpdate = event.payload;
    if (!msgUpdate.key.id || !msgUpdate.update.status) { return }

    const result = await this.messageService.updateMessageStatus(
      msgUpdate.key.id,
      msgUpdate.update.status
    );

    if (result.matchedCount === 0 || result.modifiedCount === 0) { return }

    const statusLabel = MessageStatusMapper.toInternalStatus(msgUpdate.update.status);
    msgUpdate.update['statusLabel'] = statusLabel;
    await this.indexingService.indexEvent('events-baileys-messages', event);
  }
}
