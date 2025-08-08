import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from '../application-services/scheduler.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WeatherModule } from '../../weather/infrastructure/weather.module';
import { SubscriptionModule } from '@subscription/infrastructure/subscription.module';
import { EventBusModule } from '@shared/event-bus/infrastructure/event-bus.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'events',
    }),
    PrismaModule,
    WeatherModule,
    SubscriptionModule,
    EventBusModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
