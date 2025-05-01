import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

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
  constructor() { }

  @OnEvent('QrCodeGenerated', { async: true })
  async handleQRCodeGenerated(event: StructuredEvent<QrCodeGeneratedPayload>) { }

  @OnEvent('ConnectionClosed', { async: true })
  async handleConnectionClosed(event: StructuredEvent<ConnectionClosedPayload>) { }

  @OnEvent('ConnectionLoggedOut', { async: true })
  async handleLoggedOut(event: StructuredEvent<ConnectionLoggedOutPayload>) { }

  @OnEvent('ConnectionOpened', { async: true })
  async handleConnectionOpened(event: StructuredEvent<ConnectionOpenedPayload>) { }

  @OnEvent('CredsUpdated', { async: true })
  async handleCredsUpdated(event: StructuredEvent<CredsUpdatedPayload>) { }
}
