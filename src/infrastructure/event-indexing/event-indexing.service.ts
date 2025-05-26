import { Injectable } from '@nestjs/common';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';

@Injectable()
export class EventIndexingService {
  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  // Método para indexar um evento no Elasticsearch
  async indexEvent(index: string, event: StructuredEvent<any>): Promise<void> {
    try {
      await this.elasticsearchService.indexEvent(index, {
        ...event,
        '@timestamp': event.timestamp,
      });
    } catch (error) {
      console.error(`Erro ao indexar evento no índice ${index}:`, error);
    }
  }
}
