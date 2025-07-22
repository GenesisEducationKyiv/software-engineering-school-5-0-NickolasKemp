import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/infrastructure/logger';
import {
  WeatherUpdateNotificationPayload,
  SubscriptionConfirmationNotificationPayload,
} from '@shared/event-bus/domain-services/notification/notification.event';
import { NotificationSenderService } from '@notification-sender/domain-services/notification-sender.service';

@Injectable()
export class NotificationHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  constructor(private readonly notificationSenderService: NotificationSenderService) {}

  async handleSubscriptionConfirmation(
    payload: SubscriptionConfirmationNotificationPayload,
  ): Promise<void> {
    const { to, context } = payload;
    this.logger.log(`Processing subscription confirmation for ${to}`);
    try {
      await this.notificationSenderService.sendConfirmationEmail(to, context);
      this.logger.log(`Subscription confirmation email sent to ${to}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process subscription confirmation for ${to}`, error);
    }
  }

  async handleWeatherUpdate(payload: WeatherUpdateNotificationPayload): Promise<void> {
    const { to, context } = payload;
    this.logger.log(`Processing weather update for ${to}, city: ${context.city}`);
    try {
      await this.notificationSenderService.sendWeatherUpdateEmail(to, context);
      this.logger.log(`Weather update email sent to ${to} for ${context.city}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process weather update for ${to}, city: ${context.city}`, error);
    }
  }
}
