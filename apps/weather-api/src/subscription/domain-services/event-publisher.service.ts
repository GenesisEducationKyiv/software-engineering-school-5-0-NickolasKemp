import { Injectable } from '@nestjs/common';
import {
  WeatherUpdateSubscriptionPayload,
  SubscriptionEvent,
  WeatherUpdateSubscriptionEvent,
  ConfirmationSubscriptionEvent,
  ConfirmationSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';
import { EventBusSubscriptionTopic } from '@shared/event-bus/infrastructure/subscription-topic';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly eventBus: EventBusSubscriptionTopic) {}

  async sendWeatherUpdate(
    to: string,
    context: WeatherUpdateSubscriptionPayload['context'],
  ): Promise<void> {
    this.logger.log(`Sending weather update event to ${to} for ${context.city}`);

    const event: WeatherUpdateSubscriptionEvent = {
      name: SubscriptionEvent.WEATHER_UPDATE,
      payload: {
        to,
        context,
      },
    };

    await this.eventBus.publish(event);
  }

  async sendSubscriptionConfirmation(
    to: string,
    context: ConfirmationSubscriptionPayload['context'],
  ): Promise<void> {
    this.logger.log(`Sending subscription confirmation event to ${to}`);

    const event: ConfirmationSubscriptionEvent = {
      name: SubscriptionEvent.CONFIRMATION,
      payload: {
        to,
        context,
      },
    };

    await this.eventBus.publish(event);
  }
}
