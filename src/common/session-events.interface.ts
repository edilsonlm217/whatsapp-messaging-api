import { Contact } from "@whiskeysockets/baileys";

export interface QrCodeGeneratedPayload {
  qr: string;
}

export interface ConnectionOpenedPayload {
  connection: 'open';
}

export interface ConnectionClosedPayload {
  connection: 'close';
}

export interface ConnectionLoggedOutPayload {
  connection: 'logged-out';
}

export interface CredsUpdatedPayload {
  me: Contact | undefined
  platform: string | undefined;
  lastAccountSyncTimestamp: number | undefined
}
