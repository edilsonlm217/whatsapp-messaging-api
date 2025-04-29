import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsStoreService } from './event-store/event-store.service';
import { AuthenticationCreds, ConnectionState } from '@whiskeysockets/baileys';

@Injectable()
export class EventPersisterService {
  constructor(private readonly eventsStoreService: EventsStoreService) { }

  @OnEvent('baileys.connection.update', { async: true })
  async onConnectionUpdate(payload: { sessionId: string; update: Partial<ConnectionState> }) {
    await this.eventsStoreService.append({
      sessionId: payload.sessionId,
      type: 'baileys.connection.update',
      aggregateId: payload.sessionId,
      payload: payload.update,
    });
  }

  @OnEvent('baileys.creds.update', { async: true })
  async onCredsUpdate(payload: { sessionId: string; update: Partial<AuthenticationCreds>, creds: AuthenticationCreds }) {
    await this.eventsStoreService.append({
      sessionId: payload.sessionId,
      type: 'baileys.creds.update',
      aggregateId: payload.sessionId,
      payload: payload.update,
    });
  }
}
