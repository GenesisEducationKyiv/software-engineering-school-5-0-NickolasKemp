import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Logger } from '@shared/infrastructure/logger';
import { EmailSender } from '@notification-sender/domain-services/email-sender.interface';
import { WeatherHttpService } from '@notification-sender/infrastructure/weather/weather-http.service';
import {
  WeatherNotificationPayload,
  EmailNotificationPayload,
} from '@shared/event-bus/domain-services/types/notification.types';

interface NotificationJobData {
  type: 'weather-update' | 'subscription-confirmation' | 'subscription-cancellation';
  payload: WeatherNotificationPayload | EmailNotificationPayload;
}

@Processor('events')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(WeatherHttpService) private readonly weatherService: WeatherHttpService,
    private readonly emailSender: EmailSender,
  ) {}

  @Process('notification.email')
  async processNotification(job: Job<NotificationJobData>): Promise<void> {
    const { type, payload } = job.data;
    this.logger.log(`Processing ${type} notification`);

    try {
      switch (type) {
        case 'weather-update':
          await this.processWeatherUpdate(payload as WeatherNotificationPayload);
          break;
        case 'subscription-confirmation':
          await this.processSubscriptionConfirmation(payload as EmailNotificationPayload);
          break;
        case 'subscription-cancellation':
          await this.processSubscriptionCancellation(payload as EmailNotificationPayload);
          break;
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
    } catch (error: unknown) {
      this.logger.error(`Failed to process ${type} notification`, error);
      throw error;
    }
  }

  private async processWeatherUpdate(payload: WeatherNotificationPayload): Promise<void> {
    const { email, city, token, appUrl } = payload;
    this.logger.log(`Processing weather update for ${email}, city: ${city}`);

    const weather = await this.weatherService.getWeather(city);
    await this.emailSender.sendWeatherUpdate(email, {
      city,
      weather,
      unsubscribeToken: token,
      appUrl,
    });

    this.logger.log(`Weather update email sent to ${email} for ${city}`);
  }

  private async processSubscriptionConfirmation(payload: EmailNotificationPayload): Promise<void> {
    const { to, subject, template, context } = payload;
    this.logger.log(`Processing subscription confirmation for ${to}`);

    await this.emailSender.sendEmail(to, subject, template, context);
    this.logger.log(`Subscription confirmation email sent to ${to}`);
  }

  private async processSubscriptionCancellation(payload: EmailNotificationPayload): Promise<void> {
    const { to, subject, template, context } = payload;
    this.logger.log(`Processing subscription cancellation for ${to}`);

    await this.emailSender.sendEmail(to, subject, template, context);
    this.logger.log(`Subscription cancellation email sent to ${to}`);
  }
}
