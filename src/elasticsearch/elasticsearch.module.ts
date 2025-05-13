import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch'; // Importando o cliente oficial do Elasticsearch
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  providers: [
    {
      provide: Client,  // Injetando o cliente diretamente
      useFactory: (configService: ConfigService) => {
        const node = configService.get<string>('APP_PORT');
        console.log(node);
        console.log(process.env);
        return new Client({
          node: configService.get<string>('ELASTICSEARCH_NODE'), // Usando variável de ambiente
        });
      },
      inject: [ConfigService],  // Injetando o ConfigService para acessar as variáveis de ambiente
    },
    ElasticsearchService, // Seu serviço que vai usar o cliente
  ],
  exports: [ElasticsearchService],  // Exportando o serviço para outros módulos
})
export class ElasticsearchModule { }
