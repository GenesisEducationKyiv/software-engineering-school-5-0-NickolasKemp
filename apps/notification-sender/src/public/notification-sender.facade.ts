import { Injectable } from '@nestjs/common';
import { EmailSender } from '../domain-services/email-sender.interface';
import {
  WeatherUpdateEmailData,
  ConfirmationEmailData,
} from '../application-services/types/email.interface';

@Injectable()
export class NotificationSenderFacade {
  constructor(private readonly emailSender: EmailSender) {}

  async sendWeatherUpdateNotification(email: string, data: WeatherUpdateEmailData): Promise<void> {
    await this.emailSender.sendWeatherUpdate(email, data);
  }

  async sendConfirmationNotification(email: string, data: ConfirmationEmailData): Promise<void> {
    await this.emailSender.sendConfirmationEmail(email, data);
  }
}
