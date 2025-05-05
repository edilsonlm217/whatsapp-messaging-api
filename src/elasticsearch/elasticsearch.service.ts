import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  constructor(private readonly client: Client) { }

  // Método para indexar um evento no Elasticsearch
  async indexEvent(index: string, event: any): Promise<void> {
    try {
      await this.client.index({
        index,   // Nome do índice
        body: event, // Dados do evento
      });
    } catch (error) {
      console.error('Erro ao indexar evento:', error);
    }
  }
}
