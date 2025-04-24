import { Injectable } from "@nestjs/common";
import { SignalDataSet } from "@whiskeysockets/baileys";
import { KeysRepository } from "../../../persistence/repositories/keys.repository";

@Injectable()
export class BaileysKeysStore {
  constructor(private readonly keysRepository: KeysRepository) { }

  public async load(sessionId: string, type: string, ids: string[]): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    await Promise.all(ids.map(async (id) => {
      data[id] = await this.keysRepository.readKey(`${sessionId}-${type}-${id}.json`);
    }));
    return data;
  }

  public async store(sessionId: string, data: SignalDataSet): Promise<void> {
    const ops = Object.entries(data).flatMap(([category, items]) =>
      Object.entries(items).map(([id, value]) => {
        const file = `${sessionId}-${category}-${id}.json`;
        return value
          ? this.keysRepository.writeKey(value, file)
          : this.keysRepository.removeKey(file);
      })
    );
    await Promise.all(ops);
  }

  public async deleteAll(sessionId: string): Promise<void> {
    const files = await this.keysRepository.listKeys(sessionId);
    await Promise.all(files.map(file => this.keysRepository.removeKey(file)));
  }
}
