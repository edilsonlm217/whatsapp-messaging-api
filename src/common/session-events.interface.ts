import { AuthenticationCreds, Contact } from "@whiskeysockets/baileys";

export interface QrCodeGeneratedPayload {
  qr: string;
}

export interface ConnectionOpenedPayload {
  connection: 'open';
}

export interface ConnectionStartedPayload {
  connection: 'connecting';
}

export interface ConnectionClosedPayload {
  connection: 'close';
}

export interface ConnectionLoggedOutPayload {
  connection: 'logged-out';
}

export type CredsUpdatedPayload = AuthenticationCreds;
