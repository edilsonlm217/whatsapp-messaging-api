import { Injectable } from '@nestjs/common';
import { CredsRepository } from '../../database/repositories/creds.repository';
import { KeysRepository } from '../../database/repositories/keys.repository';
import { AuthenticationState, initAuthCreds } from '@whiskeysockets/baileys';

@Injectable()
export class MultiFileAuthStateService {
  constructor(
    private readonly credsRepository: CredsRepository,
    private readonly keysRepository: KeysRepository,
  ) { }

  // Função principal para obter o estado de autenticação para uma sessão
  public async getAuthState(sessionId: string): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
    const creds = (await this.credsRepository.readCreds(`${sessionId}-creds.json`)) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async (type, ids) => {
            const data: { [_: string]: any } = {};
            await Promise.all(
              ids.map(async (id) => {
                let value = await this.keysRepository.readKey(`${sessionId}-${type}-${id}.json`);
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
                const file = `${sessionId}-${category}-${id}.json`;
                tasks.push(value ? this.keysRepository.writeKey(value, file) : this.keysRepository.removeKey(file));
              }
            }
            await Promise.all(tasks);
          }
        }
      },
      saveCreds: async () => {
        return this.credsRepository.writeCreds(creds, `${sessionId}-creds.json`);
      }
    };
  }

  public async deleteAuthState(sessionId: string): Promise<void> {
    // Remove as credenciais
    await this.credsRepository.removeCreds(`${sessionId}-creds.json`);

    // Remove todas as chaves associadas à sessão
    const files = await this.keysRepository.listKeys(sessionId); // Agora pega todos os arquivos que começam com o sessionId
    await Promise.all(files.map(file => this.keysRepository.removeKey(file)));

    console.log(`Credenciais e chaves da sessão ${sessionId} removidas.`);
  }

}
