import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksService } from '../domain-services/tasks.service';
import { WeatherUpdatesProcessor } from '../app-services/weather-updates.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { WeatherModule } from '../../weather/infrastructure/weather.module';
import { EmailModule } from '../../infrastructure/email-sender/email.module';
import { SubscriptionModule } from 'src/subscription/infrastructure/subscription.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'weather-updates',
    }),
    PrismaModule,
    WeatherModule,
    EmailModule,
    SubscriptionModule,
  ],
  providers: [TasksService, WeatherUpdatesProcessor],
  exports: [TasksService],
})
export class TasksModule {}
