import { AuthenticationCreds } from "@whiskeysockets/baileys";

// baileys/events/creds-updated.event.ts
export class CredsUpdatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly update: Partial<AuthenticationCreds>,
  ) { }
}
