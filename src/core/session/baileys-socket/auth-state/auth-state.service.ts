import { Injectable } from "@nestjs/common";
import { AuthenticationCreds, AuthenticationState, initAuthCreds } from "@whiskeysockets/baileys";
import { CredsService } from "./services/creds.service";
import { KeysService } from "./services/keys.service";

@Injectable()
export class AuthStateService {
  constructor(
    private readonly credsService: CredsService,
    private readonly keysService: KeysService,
  ) { }

  public async getAuthState(sessionId: string): Promise<AuthenticationState> {
    const creds = (await this.credsService.loadCreds(sessionId)) || initAuthCreds();
    return {
      creds,
      keys: {
        get: (type, ids) => this.keysService.loadKeys(sessionId, type, ids),
        set: (data) => this.keysService.storeKeys(sessionId, data),
      }
    };
  }

  public async saveCreds(sessionId: string, creds: AuthenticationCreds) {
    await this.credsService.saveCreds(sessionId, creds);
  }

  public async deleteAuthState(sessionId: string) {
    await this.credsService.deleteCreds(sessionId);
    await this.keysService.deleteKeys(sessionId);
    console.log(`Credenciais e chaves da sessão ${sessionId} removidas.`);
  }
}
