import { NestFactory } from '@nestjs/core';
import { NotficationSenderModule } from './notfication-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(NotficationSenderModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
