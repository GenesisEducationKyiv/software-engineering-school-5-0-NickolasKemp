import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@shared/infrastructure/logger';
import { SubscriptionFacade } from './subscription.facade';
import { NotificationService } from '../domain-services/notification.service';
import { WeatherFacade } from '../../weather/facade/weather.facade';

interface SubscriptionLike {
  email: string;
  city: string;
  unsubscribeToken: string;
}

@Injectable()
export class WeatherUpdateFacade {
  private readonly logger = new Logger(WeatherUpdateFacade.name);

  constructor(
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly weatherFacade: WeatherFacade,
  ) {}

  async sendHourlyWeatherUpdates(): Promise<void> {
    this.logger.log('Sending hourly weather updates');
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('hourly');
    await this.notifyGroupedByCity(subscriptions);
  }

  async sendDailyWeatherUpdates(): Promise<void> {
    this.logger.log('Sending daily weather updates');
    const subscriptions =
      await this.subscriptionFacade.getConfirmedSubscriptionsByFrequency('daily');
    await this.notifyGroupedByCity(subscriptions);
  }

  private async notifyGroupedByCity(subscriptions: SubscriptionLike[]): Promise<void> {
    const cityMap = new Map<string, SubscriptionLike[]>();
    for (const sub of subscriptions) {
      if (!cityMap.has(sub.city)) cityMap.set(sub.city, []);
      cityMap.get(sub.city)!.push(sub);
    }

    for (const [city, subs] of cityMap.entries()) {
      const weather = await this.weatherFacade.getWeather({ city });
      for (const sub of subs) {
        await this.notificationService.sendWeatherUpdate(sub.email, {
          city,
          unsubscribeToken: sub.unsubscribeToken,
          appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
          weather,
        });
      }
    }
  }
}
