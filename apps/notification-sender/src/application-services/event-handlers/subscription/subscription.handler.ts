import { Injectable } from '@nestjs/common';
import {
  WeatherUpdateSubscriptionPayload,
  ConfirmationSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';
import { NotificationSenderService } from '@notification-sender/domain-services/notification-sender.service';
import { AbstractSubscriptionHandler } from './subscription-handler.interface';

@Injectable()
export class SubscriptionHandler implements AbstractSubscriptionHandler {
  constructor(private readonly notificationSenderService: NotificationSenderService) {}

  async handleSubscriptionConfirmation(payload: ConfirmationSubscriptionPayload): Promise<void> {
    const { to, context } = payload;
    await this.notificationSenderService.sendConfirmationEmail(to, context);
  }

  async handleWeatherUpdate(payload: WeatherUpdateSubscriptionPayload): Promise<void> {
    const { to, context } = payload;
    await this.notificationSenderService.sendWeatherUpdateEmail(to, context);
  }
}
