// bull-queues.module.ts (ou algum módulo relacionado a filas)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueNames } from 'src/common/enums/queue-names.enum';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueNames.WHATSAPP_SESSION_RECONNECT,
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [],
})
export class QueueModule { }
