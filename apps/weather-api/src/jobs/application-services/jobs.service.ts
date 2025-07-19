import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@shared/infrastructure/logger';
import { SubscriptionFacade } from '@subscription/public/subscription.facade';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('weather-updates') private weatherQueue: Queue,
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleHourlyUpdates(): Promise<void> {
    this.logger.log('Scheduling hourly weather updates');
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('hourly');

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
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('daily');

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
