import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailSender,
  WeatherUpdateEmailData,
  ConfirmationEmailData,
  EmailTemplate,
} from '../interfaces/email.interface';
import { generateConfirmationTemplate, generateWeatherUpdateTemplate } from './template-generator';
import { Logger } from 'src/infrastructure/logger';

interface SmtpError extends Error {
  code?: string;
}

@Injectable()
export class EmailService implements EmailSender {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } catch (error: unknown) {
      this.logger.error('Failed to create email transporter', error);
      throw error;
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      await this.transporter.sendMail({
        to,
        ...template,
      });
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}`, error);

      const smtpError = error as SmtpError;
      if (smtpError.code === 'EENVELOPE' || smtpError.message?.includes('Invalid recipient')) {
        throw new BadRequestException('Invalid email address');
      }

      throw error;
    }
  }

  async sendConfirmationEmail(email: string, data: ConfirmationEmailData): Promise<void> {
    try {
      const template = generateConfirmationTemplate(data);
      await this.sendEmail(email, template);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to send confirmation email to ${email}`, error);
      throw error;
    }
  }

  async sendWeatherUpdate(email: string, data: WeatherUpdateEmailData): Promise<void> {
    try {
      const template = generateWeatherUpdateTemplate(data);
      await this.sendEmail(email, template);
      this.logger.log(`Weather update sent to ${email} for ${data.city}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to send weather update to ${email} for ${data.city}`, error);
      throw error;
    }
  }
}
