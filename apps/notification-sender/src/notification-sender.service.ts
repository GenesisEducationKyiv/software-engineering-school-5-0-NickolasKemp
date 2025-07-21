import { Injectable } from '@nestjs/common';
import { EmailService } from './application-services/email-sender';
import {
  ConfirmationEmailData,
  WeatherUpdateEmailData,
} from './application-services/types/email.interface';

@Injectable()
export class NotificationSenderService {
  constructor(private readonly emailService: EmailService) {}

  async sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void> {
    await this.emailService.sendConfirmationEmail(email, data);
  }

  async sendWeatherUpdateEmail(email: string, data: WeatherUpdateEmailData): Promise<void> {
    await this.emailService.sendWeatherUpdate(email, data);
  }
}
