import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Remove o timeout padrão do Node.js (0 = sem timeout)
  app.getHttpServer().setTimeout(0);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
