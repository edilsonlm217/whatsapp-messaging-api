import { Injectable } from "@nestjs/common";
import { AuthenticationCreds } from "@whiskeysockets/baileys";
import { CredsRepository } from "../repositories/creds.repository";

@Injectable()
export class CredsService {
  constructor(private readonly credsRepository: CredsRepository) { }

  public async loadCreds(sessionId: string) {
    return this.credsRepository.readCreds(`${sessionId}-creds.json`);
  }

  public async saveCreds(sessionId: string, creds: AuthenticationCreds): Promise<void> {
    await this.credsRepository.writeCreds(creds, `${sessionId}-creds.json`);
  }

  public async deleteCreds(sessionId: string): Promise<void> {
    await this.credsRepository.removeCreds(`${sessionId}-creds.json`);
  }

  public async listSessionIds() {
    return this.credsRepository.listSessionIds();
  }
}
