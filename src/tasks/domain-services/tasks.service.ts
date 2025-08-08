import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Scheduler } from '../../domain/task.interface';
import { Logger } from 'src/infrastructure/logger';
import { AbstractSubscriptionRepository } from '../../domain/subscription.interface';

@Injectable()
export class TasksService implements Scheduler {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectQueue('weather-updates') private weatherQueue: Queue,
    @Inject(AbstractSubscriptionRepository)
    private readonly subscriptionRepository: AbstractSubscriptionRepository,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleHourlyUpdates(): Promise<void> {
    this.logger.log('Scheduling hourly weather updates');
    const subscriptions = await this.subscriptionRepository.findManyConfirmedByFrequency('hourly');

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
    const subscriptions = await this.subscriptionRepository.findManyConfirmedByFrequency('daily');

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
