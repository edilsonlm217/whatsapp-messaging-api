import { AuthenticationCreds } from "@whiskeysockets/baileys";

export class UpdateSessionCredsCommand {
  constructor(
    public readonly sessionId: string,
    public readonly creds: AuthenticationCreds
  ) { }
}
