import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from '../../application-services/types/email.interface';
import { Logger } from '@shared/infrastructure/logger';
import { AbstractEmailSender } from '@notification-sender/domain-services/email-sender.interface';

interface SmtpError extends Error {
  code?: string;
}

@Injectable()
export class EmailSender implements AbstractEmailSender {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailSender.name);

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

  async sendEmail(to: string, template: EmailTemplate): Promise<void> {
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
}
