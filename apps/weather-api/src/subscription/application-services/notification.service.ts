import { Injectable } from '@nestjs/common';
import { EventBus } from '@shared/event-bus/domain-services/event-bus.interface';
import { EVENT_BUS_EVENTS } from '@shared/event-bus/domain-services/contants/event-bus.constants';
import {
  WeatherNotificationPayload,
  EmailNotificationPayload,
} from '@shared/event-bus/domain-services/types/notification.types';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventBus: EventBus) {}

  async sendWeatherUpdate(payload: WeatherNotificationPayload): Promise<void> {
    this.logger.log(`Sending weather update notification to ${payload.email} for ${payload.city}`);

    await this.eventBus.publish({
      name: EVENT_BUS_EVENTS.NOTIFICATION.EMAIL,
      payload: {
        type: 'weather-update',
        payload,
      },
    });
  }

  async sendSubscriptionConfirmation(payload: EmailNotificationPayload): Promise<void> {
    this.logger.log(`Sending subscription confirmation to ${payload.to}`);

    await this.eventBus.publish({
      name: EVENT_BUS_EVENTS.NOTIFICATION.EMAIL,
      payload: {
        type: 'subscription-confirmation',
        payload,
      },
    });
  }

  async sendSubscriptionCancellation(payload: EmailNotificationPayload): Promise<void> {
    this.logger.log(`Sending subscription cancellation to ${payload.to}`);

    await this.eventBus.publish({
      name: EVENT_BUS_EVENTS.NOTIFICATION.EMAIL,
      payload: {
        type: 'subscription-cancellation',
        payload,
      },
    });
  }
}
