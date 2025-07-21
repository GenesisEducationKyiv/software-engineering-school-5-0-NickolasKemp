import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@shared/infrastructure/logger';
import { SubscriptionFacade } from './subscription.facade';
import { NotificationService } from '../application-services/notification.service';

@Injectable()
export class WeatherUpdateFacade {
  private readonly logger = new Logger(WeatherUpdateFacade.name);

  constructor(
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async sendHourlyWeatherUpdates(): Promise<void> {
    this.logger.log('Sending hourly weather updates');
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('hourly');

    for (const sub of subscriptions) {
      await this.notificationService.sendWeatherUpdate({
        email: sub.email,
        city: sub.city,
        token: sub.unsubscribeToken,
        appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
      });
    }
  }

  async sendDailyWeatherUpdates(): Promise<void> {
    this.logger.log('Sending daily weather updates');
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('daily');

    for (const sub of subscriptions) {
      await this.notificationService.sendWeatherUpdate({
        email: sub.email,
        city: sub.city,
        token: sub.unsubscribeToken,
        appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
      });
    }
  }
}
