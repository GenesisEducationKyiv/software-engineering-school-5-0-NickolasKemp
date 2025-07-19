import { WeatherData } from '../../../../weather-api/src/weather/domain/weather.interface';

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

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}
