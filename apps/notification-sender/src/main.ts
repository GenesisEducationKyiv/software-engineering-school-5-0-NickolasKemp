import { NestFactory } from '@nestjs/core';
import { NotificationSenderModule } from './infrastructure/notification-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationSenderModule);
  await app.listen(process.env.PORT ?? 3002);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
