import {
  WeatherUpdateEmailData,
  ConfirmationEmailData,
} from '@notification-sender/application-services/types/email.interface';

export abstract class EmailSender {
  abstract sendWeatherUpdate(email: string, data: WeatherUpdateEmailData): Promise<void>;
  abstract sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void>;
}
