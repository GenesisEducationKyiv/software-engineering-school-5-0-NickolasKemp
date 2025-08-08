export const SUBSCRIPTION_EVENT_GROUP = 'subscription';

export enum SubscriptionEvent {
  WEATHER_UPDATE = 'weather-update',
  CONFIRMATION = 'confirmation',
}

export interface SubscriptionEventPayload {
  to: string;
  context: Record<string, unknown>;
}

// #region Weather Update Notification

interface WeatherData {
  humidity: number;
  temperature: number;
  description: string;
}

export interface WeatherUpdateSubscriptionPayload extends SubscriptionEventPayload {
  context: {
    weather: WeatherData;
    city: string;
    unsubscribeToken: string;
    appUrl: string;
  };
}

export interface WeatherUpdateSubscriptionEvent {
  name: SubscriptionEvent.WEATHER_UPDATE;
  payload: WeatherUpdateSubscriptionPayload;
}

// #endregion

// #region Subscription Confirmation Notification

export interface ConfirmationSubscriptionPayload extends SubscriptionEventPayload {
  context: {
    token: string;
    appUrl: string;
  };
}

export interface ConfirmationSubscriptionEvent {
  name: SubscriptionEvent.CONFIRMATION;
  payload: ConfirmationSubscriptionPayload;
}

// #endregion
