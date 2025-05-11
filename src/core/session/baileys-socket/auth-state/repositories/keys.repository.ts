import { Injectable, Logger } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { Inject } from '@nestjs/common';

@Injectable()
export class KeysRepository {
  private keysCollection: Collection;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    this.keysCollection = this.db.collection('keys');
  }

  // Função para escrever chave no MongoDB com campos isolados
  async writeKey(sessionId: string, category: string, id: string, keyData: any): Promise<void> {
    try {
      await this.keysCollection.updateOne(
        { sessionId, category, id },  // Usando sessionId, category e id isolados
        { $set: { keyData } },  // Apenas os dados binários, sem JSON.stringify
        { upsert: true }  // Cria se não existir, atualiza se já existir
      );
    } catch (error) {
      Logger.error(`Error writing key to MongoDB for session ${sessionId}, category ${category}, id ${id}: ${error.message}`);
    }
  }

  // Função para ler chave do MongoDB com base nos campos isolados
  async readKey(sessionId: string, category: string, id: string): Promise<any> {
    try {
      const result = await this.keysCollection.findOne({ sessionId, category, id });
      return result ? result.keyData : null;  // Retorna os dados binários diretamente
    } catch (error) {
      Logger.error(`Error reading key from MongoDB for session ${sessionId}, category ${category}, id ${id}: ${error.message}`);
      return null;
    }
  }

  // Função para remover chave do MongoDB com base nos campos isolados
  async removeKey(sessionId: string, category: string, id: string): Promise<void> {
    try {
      await this.keysCollection.deleteOne({ sessionId, category, id });
    } catch (error) {
      Logger.error(`Error removing key from MongoDB for session ${sessionId}, category ${category}, id ${id}: ${error.message}`);
    }
  }

  // Função para listar chaves de um sessionId
  async listKeys(sessionId: string): Promise<string[]> {
    try {
      const cursor = this.keysCollection.find({ sessionId });
      const results = await cursor.toArray();
      return results.map((doc) => `${doc.category}-${doc.id}`);  // Retorna as combinações de category e id
    } catch (error) {
      Logger.error(`Error listing keys from MongoDB for sessionId ${sessionId}: ${error.message}`);
      return [];
    }
  }
}
