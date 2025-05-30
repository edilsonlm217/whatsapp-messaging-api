import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredEvent } from 'src/common/structured-event.interface';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';

@Injectable()
export class EventIndexingService {
  private readonly prefix: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    const appId = this.configService.get<string>('ELASTICSEARCH_APP_ID') || 'default-app';
    this.prefix = `${appId}`;
  }

  async indexEvent(index: string, event: StructuredEvent<any>): Promise<void> {
    const indexName = this.buildIndexName(index);

    try {
      await this.elasticsearchService.indexEvent(indexName, {
        ...event,
        '@timestamp': event.timestamp,
      });
    } catch (error) {
      console.error(`Erro ao indexar evento no índice ${indexName}:`, error);
    }
  }

  private buildIndexName(index: string): string {
    if (!index || typeof index !== 'string') {
      throw new Error('Índice inválido fornecido ao EventIndexingService');
    }
    return `${this.prefix}-${index}`;
  }
}
