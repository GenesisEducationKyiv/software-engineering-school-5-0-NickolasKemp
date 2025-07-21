export interface WeatherNotificationPayload {
  email: string;
  city: string;
  token: string;
  appUrl: string;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface NotificationEvent {
  type: 'weather-update' | 'subscription-confirmation' | 'subscription-cancellation';
  payload: WeatherNotificationPayload | EmailNotificationPayload;
}
