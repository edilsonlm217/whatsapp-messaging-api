import { Module, Global } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { CredsRepository } from './repositories/creds.repository';
import { KeysRepository } from './repositories/keys.repository';
import { EventRepository } from './repositories/event.repository';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService): Promise<Db> => {
        const MONGODB_HOST = configService.get<string>('MONGODB_HOST');
        const MONGODB_PORT = configService.get<number>('MONGODB_PORT');
        const MONGODB_DATABASE = configService.get<string>('MONGODB_DATABASE');
        const MONGODB_USERNAME = configService.get<string>('MONGODB_USERNAME');
        const MONGODB_PASSWORD = configService.get<string>('MONGODB_PASSWORD');

        const url = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
        const client = new MongoClient(url);

        try {
          // Tenta conectar ao banco de dados
          await client.connect();

          // Testa a conexão (fazendo um 'ping')
          await client.db().command({ ping: 1 });

          return client.db(MONGODB_DATABASE);
        } catch (error) {
          console.error('Failed to connect to MongoDB:', error);
          throw new Error('Database connection failed');
        }
      },
      inject: [ConfigService],
    },
    CredsRepository,
    KeysRepository,
    EventRepository,
  ],
  exports: [
    'DATABASE_CONNECTION',
    CredsRepository,
    KeysRepository,
    EventRepository,
  ],
})
export class DatabaseModule { }
