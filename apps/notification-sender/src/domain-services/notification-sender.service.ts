import { Injectable } from '@nestjs/common';
import {
  ConfirmationEmailData,
  WeatherUpdateEmailData,
} from '../application-services/types/email.interface';
import {
  generateConfirmationTemplate,
  generateWeatherUpdateTemplate,
} from '@notification-sender/application-services/template-generator';
import { AbstractEmailSender } from '@notification-sender/domain-services/email-sender.interface';

@Injectable()
export class NotificationSenderService {
  constructor(private readonly emailSender: AbstractEmailSender) {}

  async sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void> {
    const template = generateConfirmationTemplate(data);
    await this.emailSender.sendEmail(email, template);
  }

  async sendWeatherUpdateEmail(email: string, data: WeatherUpdateEmailData): Promise<void> {
    const template = generateWeatherUpdateTemplate(data);
    await this.emailSender.sendEmail(email, template);
  }
}
