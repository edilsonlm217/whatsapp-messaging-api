import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticationCreds, ConnectionState } from '@whiskeysockets/baileys';
import { StructuredEvent } from 'src/common/structured-event.interface';

@Injectable()
export class BaileysSocketListener {
  constructor() { }

  @OnEvent('ConnectionUpdate', { async: true })
  async onConnectionUpdate(event: StructuredEvent<ConnectionState>) {
    console.log('Connection update event', event);
  }

  @OnEvent('CredsUpdate', { async: true })
  async onCredsUpdate(event: StructuredEvent<AuthenticationCreds>) {
    console.log('Creds update event', event);
  }
}
