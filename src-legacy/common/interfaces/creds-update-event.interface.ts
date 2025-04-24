import { AuthenticationCreds } from "@whiskeysockets/baileys";

export interface CredsUpdateEvent {
  sessionId: string;
  timestamp: string;
  creds: AuthenticationCreds;
}