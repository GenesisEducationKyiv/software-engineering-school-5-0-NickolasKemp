import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { EmailModule } from '../email/email.module';
import { WeatherModule } from '../weather/weather.module';
import { SubscriptionRepository } from './prisma-subscription.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EmailModule, WeatherModule, PrismaModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
