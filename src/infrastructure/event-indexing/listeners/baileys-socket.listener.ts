import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticationCreds, ConnectionState, WAMessageUpdate } from '@whiskeysockets/baileys';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { EventIndexingService } from '../event-indexing.service';

@Injectable()
export class BaileysSocketListener {
  constructor(private readonly indexingService: EventIndexingService) { }

  @OnEvent('ConnectionUpdate', { async: true })
  async onConnectionUpdate(event: StructuredEvent<ConnectionState>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('CredsUpdate', { async: true })
  async onCredsUpdate(event: StructuredEvent<AuthenticationCreds>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('MessageUpdate', { async: true })
  async handleMessageUpdate(event: StructuredEvent<WAMessageUpdate>) {
    await this.indexingService.indexEvent(event);
  }
}
