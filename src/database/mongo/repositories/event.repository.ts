import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Db, Collection } from 'mongodb';

interface StoredEvent {
  aggregateId: string;
  type: string;
  payload: any;
  occurredOn: string;
}

@Injectable()
export class EventRepository {
  private readonly logger = new Logger(EventRepository.name);
  private eventsCollection: Collection<StoredEvent>;

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {
    this.eventsCollection = this.db.collection<StoredEvent>('events');
  }

  async save(event: StoredEvent): Promise<void> {
    try {
      await this.eventsCollection.insertOne(event);
      this.logger.log(`Evento ${event.type} salvo para aggregate ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(`Erro ao salvar evento ${event.type}: ${error.message}`);
    }
  }

  async findByAggregateId(aggregateId: string): Promise<StoredEvent[]> {
    try {
      const events = await this.eventsCollection
        .find({ aggregateId })
        .sort({ occurredOn: 1 })
        .toArray();

      if (events.length === 0) {
        this.logger.warn(`Nenhum evento encontrado para aggregate ${aggregateId}`);
      }

      return events;
    } catch (error) {
      this.logger.error(`Erro ao buscar eventos do aggregate ${aggregateId}: ${error.message}`);
      return [];
    }
  }
}
