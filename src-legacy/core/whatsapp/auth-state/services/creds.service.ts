import { Injectable } from "@nestjs/common";
import { AuthenticationCreds, initAuthCreds } from "@whiskeysockets/baileys";
import { CredsRepository } from "src/database/mongo/repositories/creds.repository";

@Injectable()
export class CredsService {
  constructor(private readonly credsRepository: CredsRepository) { }

  public async loadCreds(sessionId: string): Promise<AuthenticationCreds> {
    return (await this.credsRepository.readCreds(`${sessionId}-creds.json`)) || initAuthCreds();
  }

  public async saveCreds(sessionId: string, creds: AuthenticationCreds): Promise<void> {
    await this.credsRepository.writeCreds(creds, `${sessionId}-creds.json`);
  }

  public async deleteCreds(sessionId: string): Promise<void> {
    await this.credsRepository.removeCreds(`${sessionId}-creds.json`);
  }
}
