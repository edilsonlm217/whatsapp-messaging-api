import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch'; // Importando o cliente oficial do Elasticsearch
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  providers: [
    {
      provide: Client,
      useFactory: (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('ELASTICSEARCH_NODE')
        });
      },
      inject: [ConfigService],
    },
    ElasticsearchService,
  ],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule { }

