import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@shared/infrastructure/logger';
import { EventBusSubscriptionTopic } from '@shared/event-bus/infrastructure/subscription-topic';
import {
  SubscriptionEvent,
  ConfirmationSubscriptionPayload,
  WeatherUpdateSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';
import { AbstractSubscriptionHandler } from '@notification-sender/application-services/event-handlers/subscription/subscription-handler.interface';

@Injectable()
export class NotificationEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger(NotificationEventSubscriber.name);

  constructor(
    private readonly subscriptionTopic: EventBusSubscriptionTopic,
    private readonly subscriptionHandler: AbstractSubscriptionHandler,
  ) {}

  onModuleInit(): void {
    this.logger.log('Initializing notification event subscriptions');
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    this.subscriptionTopic.subscribe(
      SubscriptionEvent.CONFIRMATION,
      (payload: ConfirmationSubscriptionPayload) =>
        this.subscriptionHandler.handleSubscriptionConfirmation(payload),
    );

    this.subscriptionTopic.subscribe(
      SubscriptionEvent.WEATHER_UPDATE,
      (payload: WeatherUpdateSubscriptionPayload) =>
        this.subscriptionHandler.handleWeatherUpdate(payload),
    );

    this.logger.log('Successfully subscribed to subscription events');
  }
}
