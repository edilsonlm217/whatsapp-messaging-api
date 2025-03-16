import { Injectable, Logger } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { Inject } from '@nestjs/common';
import {
  AuthenticationState,
  initAuthCreds,
  AuthenticationCreds,
  SignalDataTypeMap,
  proto,
  BufferJSON,
} from '@whiskeysockets/baileys';

// O serviço será agora dependente da conexão global com o MongoDB
@Injectable()
export class MultiFileAuthStateService {
  private credsCollection: Collection;
  private keysCollection: Collection;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    // Inicializamos as coleções
    this.credsCollection = this.db.collection('creds');
    this.keysCollection = this.db.collection('keys');
  }

  // Função para escrever dados no MongoDB
  private async writeData(collection: Collection, data: any, file: string) {
    try {
      await collection.updateOne(
        { file },
        { $set: { data: JSON.stringify(data, BufferJSON.replacer) } },
        { upsert: true }
      );
    } catch (error) {
      console.error(`Error writing to MongoDB for file ${file}: ${error.message}`);
    }
  }

  // Função para ler dados do MongoDB
  private async readData(collection: Collection, file: string) {
    try {
      const result = await collection.findOne({ file });
      return result ? JSON.parse(result.data, BufferJSON.reviver) : null;
    } catch (error) {
      console.error(`Error reading from MongoDB for file ${file}: ${error.message}`);
      return null;
    }
  }

  // Função para remover dados do MongoDB
  private async removeData(collection: Collection, file: string) {
    try {
      await collection.deleteOne({ file });
    } catch (error) {
      console.error(`Error removing from MongoDB for file ${file}: ${error.message}`);
    }
  }

  // Função principal para obter o estado de autenticação
  public async getAuthState(): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
    // Buscando as credenciais no MongoDB ou inicializando se não existirem
    const creds: AuthenticationCreds = (await this.readData(this.credsCollection, 'creds.json')) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async (type, ids) => {
            const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
            await Promise.all(
              ids.map(async (id) => {
                let value = await this.readData(this.keysCollection, `${type}-${id}.json`);
                if (type === 'app-state-sync-key' && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              })
            );
            return data;
          },
          set: async (data) => {
            const tasks: Promise<void>[] = [];
            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const file = `${category}-${id}.json`;
                tasks.push(value ? this.writeData(this.keysCollection, value, file) : this.removeData(this.keysCollection, file));
              }
            }
            await Promise.all(tasks);
          }
        }
      },
      saveCreds: async () => {
        return this.writeData(this.credsCollection, creds, 'creds.json');
      }
    };
  }
}
