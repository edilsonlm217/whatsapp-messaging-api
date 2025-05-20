import { Injectable } from "@nestjs/common";
import { SignalDataSet } from "@whiskeysockets/baileys";
import { KeysRepository } from "../repositories/keys.repository";

@Injectable()
export class KeysService {
  constructor(private readonly keysRepository: KeysRepository) { }

  public async loadKeys(sessionId: string, type: string, ids: string[]): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    await Promise.all(ids.map(async (id) => {
      data[id] = await this.keysRepository.readKey(`${sessionId}-${type}-${id}.json`);
    }));
    return data;
  }

  public async storeKeys(sessionId: string, data: SignalDataSet): Promise<void> {
    const promises = Object.entries(data).map(([category, items]) => {
      return Object.entries(items).map(([id, value]) => {
        const file = `${sessionId}-${category}-${id}.json`;
        return value ? this.keysRepository.writeKey(value, file) : this.keysRepository.removeKey(file);
      });
    });
    await Promise.all(promises.flat());
  }

  public async deleteKeys(sessionId: string): Promise<void> {
    const files = await this.keysRepository.listKeys(sessionId);
    await Promise.all(files.map(file => this.keysRepository.removeKey(file)));
  }
}
