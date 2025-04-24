import { ConnectionState } from '@whiskeysockets/baileys';

export class ConnectionUpdatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly update: Partial<ConnectionState>,
  ) {}
}
