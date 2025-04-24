import { Injectable } from "@nestjs/common";
import { AuthenticationCreds, AuthenticationState, initAuthCreds } from "@whiskeysockets/baileys";
import { BaileysCredsStore } from "./stores/baileys-creds-store";
import { BaileysKeysStore } from "./stores/baileys-keys-store";

@Injectable()
export class BaileysAuthState {
  constructor(
    private readonly baileysCredsStore: BaileysCredsStore,
    private readonly baileysKeysStore: BaileysKeysStore,
  ) { }

  public async getAuthState(sessionId: string): Promise<AuthenticationState> {
    const creds = await this.baileysCredsStore.load(sessionId) || initAuthCreds();

    return {
      creds,
      keys: {
        get: (type, ids) => this.baileysKeysStore.load(sessionId, type, ids),
        set: (data) => this.baileysKeysStore.store(sessionId, data),
      },
    };
  }

  public async saveCreds(sessionId: string, creds: AuthenticationCreds) {
    await this.baileysCredsStore.save(sessionId, creds);
  }

  public async deleteAuthState(sessionId: string) {
    await this.baileysCredsStore.delete(sessionId);
    await this.baileysKeysStore.deleteAll(sessionId);
    console.log(`Credenciais e chaves da sessão ${sessionId} removidas.`);
  }
}
