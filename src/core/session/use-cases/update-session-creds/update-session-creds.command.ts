import { AuthenticationCreds } from "@whiskeysockets/baileys";

export class UpdateSessionCredsCommand {
  constructor(
    public readonly sessionId: string,
    public readonly phone: string,
    public readonly phonePlatform: string,
    public readonly creds: AuthenticationCreds
  ) { }
}
