import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectQueue('weather-updates') private weatherQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleHourlyUpdates(): Promise<void> {
    this.logger.log('Scheduling hourly weather updates');
    const subscriptions = await this.prisma.subscription.findMany({
      where: { confirmed: true, frequency: 'hourly' },
    });

    for (const sub of subscriptions) {
      await this.weatherQueue.add({
        email: sub.email,
        city: sub.city,
        token: sub.unsubscribeToken,
        appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
      });
    }
  }

  @Cron('0 8 * * *') // 8 AM daily
  async scheduleDailyUpdates(): Promise<void> {
    this.logger.log('Scheduling daily weather updates');
    const subscriptions = await this.prisma.subscription.findMany({
      where: { confirmed: true, frequency: 'daily' },
    });

    for (const sub of subscriptions) {
      await this.weatherQueue.add({
        email: sub.email,
        city: sub.city,
        token: sub.unsubscribeToken,
        appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
      });
    }
  }
} 