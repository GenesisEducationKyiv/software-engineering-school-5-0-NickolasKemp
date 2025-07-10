import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { WeatherUpdatesProcessor } from './weather-updates.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { WeatherModule } from '../weather/weather.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'weather-updates',
    }),
    PrismaModule,
    WeatherModule,
    EmailModule,
  ],
  providers: [TasksService, WeatherUpdatesProcessor],
  exports: [TasksService],
})
export class TasksModule {}
