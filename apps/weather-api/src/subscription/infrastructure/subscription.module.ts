import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionRepository } from './prisma-subscription.repository';
import { AbstractSubscriptionRepository } from '../domain-services/interfaces/subscription.interface';
import { SubscriptionController } from '../application-services/subscription.controller';
import { SubscriptionService } from '../domain-services/subscription.service';
import { WeatherModule } from '@weather/infrastructure/weather.module';

@Module({
  imports: [PrismaModule, WeatherModule],
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
