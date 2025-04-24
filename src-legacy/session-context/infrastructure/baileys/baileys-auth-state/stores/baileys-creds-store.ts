import { Injectable } from "@nestjs/common";
import { AuthenticationCreds } from "@whiskeysockets/baileys";
import { CredsRepository } from "../../../persistence/repositories/creds.repository";

@Injectable()
export class BaileysCredsStore {
  constructor(private readonly credsRepository: CredsRepository) { }

  public async load(sessionId: string) {
    return this.credsRepository.readCreds(this.filename(sessionId));
  }

  public async save(sessionId: string, creds: AuthenticationCreds): Promise<void> {
    await this.credsRepository.writeCreds(creds, this.filename(sessionId));
  }

  public async delete(sessionId: string): Promise<void> {
    await this.credsRepository.removeCreds(this.filename(sessionId));
  }

  private filename(sessionId: string) {
    return `${sessionId}-creds.json`;
  }
}
