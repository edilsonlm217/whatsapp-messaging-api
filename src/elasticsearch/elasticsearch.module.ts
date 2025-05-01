import { Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch'; // Importando o cliente oficial do Elasticsearch
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  providers: [
    {
      provide: Client,  // Injetando o cliente diretamente
      useFactory: () => {
        return new Client({
          node: 'http://localhost:9200', // URL do Elasticsearch
          // Você pode adicionar mais configurações aqui, caso necessário
        });
      },
    },
    ElasticsearchService, // Seu serviço que vai usar o cliente
  ],
  exports: [ElasticsearchService],  // Exportando o serviço para outros módulos
})
export class ElasticsearchModule { }
