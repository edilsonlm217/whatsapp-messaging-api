import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BaileysEventsStore } from '../persistence/eventstores/baileys-events.store';
import { AuthenticationCreds, ConnectionState } from '@whiskeysockets/baileys';

@Injectable()
export class BaileysEventPersister {
  constructor(private readonly baileysEventsStore: BaileysEventsStore) { }

  @OnEvent('baileys.connection.update', { async: true })
  async onConnectionUpdate(payload: { sessionId: string; update: Partial<ConnectionState> }) {
    await this.baileysEventsStore.append({
      sessionId: payload.sessionId,
      type: 'baileys.connection.update',
      aggregateId: payload.sessionId,
      payload: payload.update,
    });
  }

  @OnEvent('baileys.creds.update', { async: true })
  async onCredsUpdate(payload: { sessionId: string; update: Partial<AuthenticationCreds> }) {
    await this.baileysEventsStore.append({
      sessionId: payload.sessionId,
      type: 'baileys.creds.update',
      aggregateId: payload.sessionId,
      payload: payload.update,
    });
  }
}
