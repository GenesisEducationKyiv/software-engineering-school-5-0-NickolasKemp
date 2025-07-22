import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationSenderController } from '../application-services/notification-sender.controller';
import { NotificationSenderService } from '../domain-services/notification-sender.service';
import { BullModule } from '@nestjs/bull';
import { NotificationHandler } from '../application-services/event-handlers/notification.handler';
import { EmailModule } from './email/email.module';
import {
  NOTIFICATION_EVENT_GROUP,
  NotificationEvent,
  SubscriptionConfirmationNotificationPayload,
  WeatherUpdateNotificationPayload,
} from '@shared/event-bus/domain-services/notification/notification.event';
import { EventBusModule } from '@shared/event-bus/infrastructure/event-bus.module';
import { NotificationEventBus } from '@shared/event-bus/infrastructure/notification-event-bus';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          return {
            redis: redisUrl,
          };
        }

        return {
          redis: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: NOTIFICATION_EVENT_GROUP,
    }),
    EmailModule,
    EventBusModule,
  ],
  controllers: [NotificationSenderController],
  providers: [NotificationSenderService, NotificationHandler],
})
export class NotificationSenderModule {
  constructor(
    private readonly notificationEventBus: NotificationEventBus,
    private readonly notificationHandler: NotificationHandler,
  ) {}

  onModuleInit(): void {
    this.notificationEventBus.subscribe(
      NotificationEvent.SUBSCRIPTION_CONFIRMATION,
      (payload: SubscriptionConfirmationNotificationPayload) =>
        this.notificationHandler.handleSubscriptionConfirmation(payload),
    );

    this.notificationEventBus.subscribe(
      NotificationEvent.WEATHER_UPDATE,
      (payload: WeatherUpdateNotificationPayload) =>
        this.notificationHandler.handleWeatherUpdate(payload),
    );
  }
}
