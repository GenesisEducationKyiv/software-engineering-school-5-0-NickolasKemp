import {
  ConfirmationSubscriptionPayload,
  WeatherUpdateSubscriptionPayload,
} from '@shared/event-bus/domain-services/subscription/subscription.event';

export abstract class AbstractSubscriptionHandler {
  abstract handleSubscriptionConfirmation(payload: ConfirmationSubscriptionPayload): Promise<void>;
  abstract handleWeatherUpdate(payload: WeatherUpdateSubscriptionPayload): Promise<void>;
}
