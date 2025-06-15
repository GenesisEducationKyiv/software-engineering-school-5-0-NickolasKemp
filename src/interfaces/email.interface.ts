import { WeatherData } from './weather.interface';

export interface WeatherUpdateEmailData {
  city: string;
  weather: WeatherData;
  unsubscribeToken: string;
  appUrl: string;
}

export interface ConfirmationEmailData {
  token: string;
  appUrl: string;
}

export interface EmailSender {
  sendWeatherUpdate(email: string, data: WeatherUpdateEmailData): Promise<void>;
  sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void>;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}
