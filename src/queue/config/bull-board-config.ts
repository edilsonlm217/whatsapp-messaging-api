import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { QueueNames } from 'src/common/enums/queue-names.enum';

export function configureBullBoard(app: INestApplication) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Pega todas as filas registradas dinamicamente usando o enum
  const queueNames = Object.values(QueueNames);
  const queueAdapters = queueNames.map((name) => {
    const queue = app.get<Queue>(getQueueToken(name));
    return new BullAdapter(queue);
  });

  createBullBoard({
    queues: queueAdapters,
    serverAdapter,
  });

  // Retorna o serverAdapter configurado
  return serverAdapter;
}
