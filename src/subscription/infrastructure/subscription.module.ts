import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionRepository } from './prisma-subscription.repository';
import { AbstractSubscriptionRepository } from '../../domain/subscription.interface';
import { SubscriptionController } from '../app-services/subscription.controller';
import { SubscriptionService } from '../subscription.service';
import { EmailModule } from '../../infrastructure/email-sender/email.module';
import { WeatherModule } from '../../weather/infrastructure/weather.module';

@Module({
  imports: [PrismaModule, EmailModule, WeatherModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionRepository,
    {
      provide: AbstractSubscriptionRepository,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [AbstractSubscriptionRepository, SubscriptionRepository],
})
export class SubscriptionModule {}
