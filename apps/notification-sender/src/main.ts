import { NestFactory } from '@nestjs/core';
import { NotificationSenderModule } from './notification-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationSenderModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
