import { Injectable, Logger } from '@nestjs/common';
import {
  WeatherUpdateSubscriptionPayload,
  ConfirmationSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';
import { NotificationSenderService } from '@notification-sender/domain-services/notification-sender.service';

@Injectable()
export class SubscriptionHandler {
  private readonly logger = new Logger(SubscriptionHandler.name);

  constructor(private readonly notificationSenderService: NotificationSenderService) {}

  async handleSubscriptionConfirmation(payload: ConfirmationSubscriptionPayload): Promise<void> {
    const { to, context } = payload;
    this.logger.log(`Processing subscription confirmation for ${to}`);
    try {
      await this.notificationSenderService.sendConfirmationEmail(to, context);
      this.logger.log(`Subscription confirmation email sent to ${to}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process subscription confirmation for ${to}`, error);
      throw error;
    }
  }

  async handleWeatherUpdate(payload: WeatherUpdateSubscriptionPayload): Promise<void> {
    const { to, context } = payload;
    this.logger.log(`Processing weather update for ${to}, city: ${context.city}`);
    try {
      await this.notificationSenderService.sendWeatherUpdateEmail(to, context);
      this.logger.log(`Weather update email sent to ${to} for ${context.city}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process weather update for ${to}, city: ${context.city}`, error);
      throw error;
    }
  }
}
