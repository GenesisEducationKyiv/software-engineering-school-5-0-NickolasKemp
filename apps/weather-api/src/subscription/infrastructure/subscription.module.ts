import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionRepository } from './subscription.repository';
import { AbstractSubscriptionRepository } from '../domain-services/interfaces/subscription.interface';
import { SubscriptionController } from '../application-services/subscription.controller';
import { SubscriptionService } from '../domain-services/subscription.service';
import { SubscriptionFacade } from '../public/subscription.facade';
import { WeatherUpdateFacade } from '../public/weather-update.facade';
import { WeatherModule } from '@weather/infrastructure/weather.module';
import { NotificationService } from '../domain-services/notification.service';
import { EventBusModule } from '@shared/event-bus/infrastructure/event-bus.module';

@Module({
  imports: [PrismaModule, WeatherModule, EventBusModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionRepository,
    NotificationService,
    SubscriptionFacade,
    WeatherUpdateFacade,
    {
      provide: AbstractSubscriptionRepository,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [
    AbstractSubscriptionRepository,
    SubscriptionRepository,
    SubscriptionFacade,
    WeatherUpdateFacade,
  ],
})
export class SubscriptionModule {}
