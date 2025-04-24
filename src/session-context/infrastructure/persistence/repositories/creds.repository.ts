import { Injectable, Logger } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { Inject } from '@nestjs/common';
import { AuthenticationCreds, BufferJSON } from '@whiskeysockets/baileys';

@Injectable()
export class CredsRepository {
  private credsCollection: Collection;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    this.credsCollection = this.db.collection('creds');
  }

  // Função para escrever credenciais no MongoDB
  async writeCreds(creds: any, file: string): Promise<void> {
    try {
      await this.credsCollection.updateOne(
        { file },
        { $set: { data: JSON.stringify(creds, BufferJSON.replacer) } },
        { upsert: true }
      );
    } catch (error) {
      Logger.error(`Error writing creds to MongoDB for file ${file}: ${error.message}`);
    }
  }

  // Função para ler credenciais do MongoDB
  async readCreds(file: string): Promise<AuthenticationCreds | null> {
    try {
      const result = await this.credsCollection.findOne({ file });
      return result ? JSON.parse(result.data, BufferJSON.reviver) : null;
    } catch (error) {
      Logger.error(`Error reading creds from MongoDB for file ${file}: ${error.message}`);
      return null;
    }
  }

  // Função para remover credenciais do MongoDB
  async removeCreds(file: string): Promise<void> {
    try {
      const result = await this.credsCollection.deleteOne({ file });
      if (result.deletedCount > 0) {
        Logger.log(`Credenciais removidas para ${file}`);
      } else {
        Logger.warn(`Nenhuma credencial encontrada para ${file}`);
      }
    } catch (error) {
      Logger.error(`Erro ao remover credenciais do MongoDB para o arquivo ${file}: ${error.message}`);
    }
  }
}
