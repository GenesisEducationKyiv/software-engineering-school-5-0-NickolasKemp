import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestApp(app: INestApplication): Promise<void> {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await prisma.subscription.deleteMany();
  await app.init();
}

export async function teardownTestApp(): Promise<void> {
  await prisma.$disconnect();
}
