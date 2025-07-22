import { Injectable } from '@nestjs/common';
import { EventBus } from '@shared/event-bus/domain-services/event-bus.interface';
import {
  WeatherUpdateNotificationPayload,
  NotificationEvent,
  WeatherUpdateNotificationEvent,
  SubscriptionConfirmationNotificationEvent,
} from '@shared/event-bus/domain-services/notification/notification.event';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventBus: EventBus) {}

  async sendWeatherUpdate(
    to: string,
    context: WeatherUpdateNotificationPayload['context'],
  ): Promise<void> {
    this.logger.log(`Sending weather update notification to ${to} for ${context.city}`);

    const event: WeatherUpdateNotificationEvent = {
      name: NotificationEvent.WEATHER_UPDATE,
      payload: {
        to,
        subject: 'Weather Update',
        template: 'weather-update',
        context,
      },
    };

    await this.eventBus.publish(event);
  }

  async sendSubscriptionConfirmation(
    to: string,
    context: { token: string; appUrl: string },
  ): Promise<void> {
    this.logger.log(`Sending subscription confirmation to ${to}`);

    const event: SubscriptionConfirmationNotificationEvent = {
      name: NotificationEvent.SUBSCRIPTION_CONFIRMATION,
      payload: {
        to,
        subject: 'Confirm your weather subscription',
        template: 'confirmation',
        context,
      },
    };

    await this.eventBus.publish(event);
  }
}
