import { WeatherData } from '@weather/domain/weather.interface';

export const NOTIFICATION_EVENT_GROUP = 'notification';

export enum NotificationEvent {
  WEATHER_UPDATE = 'weather-update',
  SUBSCRIPTION_CONFIRMATION = 'subscription-confirmation',
}

export interface NotificationEventPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

// #region Weather Update Notification

export interface WeatherUpdateNotificationPayload extends NotificationEventPayload {
  context: {
    weather: WeatherData;
    city: string;
    unsubscribeToken: string;
    appUrl: string;
  };
}

export interface WeatherUpdateNotificationEvent {
  name: NotificationEvent.WEATHER_UPDATE;
  payload: WeatherUpdateNotificationPayload;
}

// #endregion

// #region Subscription Confirmation Notification

export interface SubscriptionConfirmationNotificationPayload extends NotificationEventPayload {
  context: {
    token: string;
    appUrl: string;
  };
}

export interface SubscriptionConfirmationNotificationEvent {
  name: NotificationEvent.SUBSCRIPTION_CONFIRMATION;
  payload: SubscriptionConfirmationNotificationPayload;
}

// #endregion
