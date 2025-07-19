import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from '../application-services/jobs.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WeatherModule } from '../../weather/infrastructure/weather.module';
import { SubscriptionModule } from '@subscription/infrastructure/subscription.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'weather-updates',
    }),
    PrismaModule,
    WeatherModule,
    SubscriptionModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
