import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureBullBoard } from './queue/config/bull-board-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverAdapter = configureBullBoard(app);
  app.use('/admin/queues', serverAdapter.getRouter());
  await app.listen(3000);
}

bootstrap();
