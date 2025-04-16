import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventStoreDBClient } from '@eventstore/db-client';
import { SessionEventsRepository } from './repositories/session-events.repository';

@Module({
  providers: [
    {
      provide: 'EVENTSTORE_CONNECTION',
      useFactory: (configService: ConfigService): EventStoreDBClient => {
        const host = configService.get<string>('EVENTSTORE_HOST', 'localhost');
        const port = configService.get<number>('EVENTSTORE_PORT', 2113);
        const insecure = configService.get<boolean>('EVENTSTORE_INSECURE', true);

        const connectionString = `esdb://${host}:${port}?tls=${!insecure}`;

        return EventStoreDBClient.connectionString(connectionString);
      },
      inject: [ConfigService],
    },
    SessionEventsRepository,
  ],
  exports: ['EVENTSTORE_CONNECTION', SessionEventsRepository],
})
export class EventStoreModule { }
