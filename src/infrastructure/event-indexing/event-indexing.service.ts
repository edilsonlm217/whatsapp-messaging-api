import { Injectable } from '@nestjs/common';
import { StructuredEvent } from 'src/common/structured-event.interface';

@Injectable()
export class EventIndexingService {

  // Lógica para enviar o evento para o Elasticsearch
  async indexEvent(event: StructuredEvent<any>) {
    console.log('Indexando evento no Elasticsearch', event);
    // Aqui você implementaria a lógica de persistência no Elasticsearch
    // Exemplo: this.client.index({ index: 'events', body: event });
  }
}
