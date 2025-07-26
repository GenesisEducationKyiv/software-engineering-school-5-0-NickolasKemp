import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/infrastructure/logger';
import {
  ConfirmationSubscriptionPayload,
  WeatherUpdateSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';
import { SubscriptionHandler } from './subscription.handler';
import { AbstractSubscriptionHandler } from './subscription-handler.interface';

@Injectable()
export class LoggedSubscriptionHandler implements AbstractSubscriptionHandler {
  private readonly logger = new Logger(LoggedSubscriptionHandler.name);

  constructor(private readonly subscriptionHandler: SubscriptionHandler) {}

  async handleSubscriptionConfirmation(payload: ConfirmationSubscriptionPayload): Promise<void> {
    const { to } = payload;
    this.logger.log(`Processing subscription confirmation for ${to}`);
    try {
      await this.subscriptionHandler.handleSubscriptionConfirmation(payload);
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
      await this.subscriptionHandler.handleWeatherUpdate(payload);
      this.logger.log(`Weather update email sent to ${to} for ${context.city}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process weather update for ${to}, city: ${context.city}`, error);
      throw error;
    }
  }
}
