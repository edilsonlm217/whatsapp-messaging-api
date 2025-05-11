import { Injectable } from "@nestjs/common";
import { SignalDataSet } from "@whiskeysockets/baileys";
import { KeysRepository } from "../repositories/keys.repository";

@Injectable()
export class KeysService {
  constructor(private readonly keysRepository: KeysRepository) { }

  // Função para carregar chaves com base no sessionId, category e ids
  public async loadKeys(sessionId: string, category: string, ids: string[]): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    await Promise.all(
      ids.map(async (id) => {
        data[id] = await this.keysRepository.readKey(sessionId, category, id);
      })
    );
    return data;
  }

  // Função para armazenar chaves no MongoDB
  public async storeKeys(sessionId: string, data: SignalDataSet): Promise<void> {
    const promises = Object.entries(data).map(([category, items]) => {
      return Object.entries(items).map(([id, value]) => {
        if (value) {
          return this.keysRepository.writeKey(sessionId, category, id, value);
        }
      });
    });
    await Promise.all(promises.flat());
  }

  // Função para deletar as chaves do MongoDB para uma sessionId
  public async deleteKeys(sessionId: string): Promise<void> {
    const files = await this.keysRepository.listKeys(sessionId);
    await Promise.all(
      files.map((file) => {
        const [category, id] = file.split("-");
        return this.keysRepository.removeKey(sessionId, category, id);
      })
    );
  }
}
