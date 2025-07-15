import { WeatherData } from '../domain/weather.interface';

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

export abstract class EmailSender {
  abstract sendWeatherUpdate(email: string, data: WeatherUpdateEmailData): Promise<void>;
  abstract sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void>;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}
