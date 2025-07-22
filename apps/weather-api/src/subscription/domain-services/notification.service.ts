import { Injectable } from '@nestjs/common';
import {
  WeatherUpdateNotificationPayload,
  NotificationEvent,
  WeatherUpdateNotificationEvent,
  SubscriptionConfirmationNotificationEvent,
  SubscriptionConfirmationNotificationPayload,
} from '@shared/event-bus/domain-services/notification/notification.event';
import { NotificationEventBus } from '@shared/event-bus/infrastructure/notification-event-bus';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventBus: NotificationEventBus) {}

  async sendWeatherUpdate(
    to: string,
    context: WeatherUpdateNotificationPayload['context'],
  ): Promise<void> {
    this.logger.log(`Sending weather update notification to ${to} for ${context.city}`);

    const event: WeatherUpdateNotificationEvent = {
      name: NotificationEvent.WEATHER_UPDATE,
      payload: {
        to,
        context,
      },
    };

    await this.eventBus.publish(event);
  }

  async sendSubscriptionConfirmation(
    to: string,
    context: SubscriptionConfirmationNotificationPayload['context'],
  ): Promise<void> {
    this.logger.log(`Sending subscription confirmation to ${to}`);

    const event: SubscriptionConfirmationNotificationEvent = {
      name: NotificationEvent.SUBSCRIPTION_CONFIRMATION,
      payload: {
        to,
        context,
      },
    };

    await this.eventBus.publish(event);
  }
}
