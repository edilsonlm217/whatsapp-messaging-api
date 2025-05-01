import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventIndexingService } from '../event-indexing.service';
import { StructuredEvent } from 'src/common/structured-event.interface';
import {
  QrCodeGeneratedPayload,
  ConnectionClosedPayload,
  ConnectionLoggedOutPayload,
  ConnectionOpenedPayload,
  CredsUpdatedPayload,
} from 'src/common/session-events.interface';

@Injectable()
export class SessionListener {
  constructor(private readonly indexingService: EventIndexingService) { }

  @OnEvent('QrCodeGenerated', { async: true })
  async handleQRCodeGenerated(event: StructuredEvent<QrCodeGeneratedPayload>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('ConnectionClosed', { async: true })
  async handleConnectionClosed(event: StructuredEvent<ConnectionClosedPayload>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('ConnectionLoggedOut', { async: true })
  async handleLoggedOut(event: StructuredEvent<ConnectionLoggedOutPayload>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('ConnectionOpened', { async: true })
  async handleConnectionOpened(event: StructuredEvent<ConnectionOpenedPayload>) {
    await this.indexingService.indexEvent(event);
  }

  @OnEvent('CredsUpdated', { async: true })
  async handleCredsUpdated(event: StructuredEvent<CredsUpdatedPayload>) {
    await this.indexingService.indexEvent(event);
  }
}
