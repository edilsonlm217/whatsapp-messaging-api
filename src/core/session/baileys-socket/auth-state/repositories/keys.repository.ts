import { Injectable, Logger } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { Inject } from '@nestjs/common';
import { BufferJSON } from '@whiskeysockets/baileys';

@Injectable()
export class KeysRepository {
  private keysCollection: Collection;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    this.keysCollection = this.db.collection('keys');
  }

  // Função para escrever chave no MongoDB
  async writeKey(key: any, file: string): Promise<void> {
    try {
      await this.keysCollection.updateOne(
        { file },
        { $set: { data: JSON.stringify(key, BufferJSON.replacer) } },
        { upsert: true }
      );
    } catch (error) {
      Logger.error(`Error writing key to MongoDB for file ${file}: ${error.message}`);
    }
  }

  // Função para ler chave do MongoDB
  async readKey(file: string): Promise<any> {
    try {
      const result = await this.keysCollection.findOne({ file });
      return result ? JSON.parse(result.data, BufferJSON.reviver) : null;
    } catch (error) {
      Logger.error(`Error reading key from MongoDB for file ${file}: ${error.message}`);
      return null;
    }
  }

  // Função para remover chave do MongoDB
  async removeKey(file: string): Promise<void> {
    try {
      await this.keysCollection.deleteOne({ file });
    } catch (error) {
      Logger.error(`Error removing key from MongoDB for file ${file}: ${error.message}`);
    }
  }

  async listKeys(sessionId: string): Promise<string[]> {
    try {
      // Procura todos os arquivos que começam com o sessionId
      const regexPattern = `^${sessionId}-.*\\.json$`; // Todos os arquivos que começam com o sessionId
      const cursor = this.keysCollection.find({ file: { $regex: regexPattern } });
      const results = await cursor.toArray();
      return results.map((doc) => doc.file);
    } catch (error) {
      Logger.error(`Error listing keys from MongoDB for sessionId ${sessionId}: ${error.message}`);
      return [];
    }
  }
}
