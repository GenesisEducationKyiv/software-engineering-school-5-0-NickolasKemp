import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationSenderController } from '../application-services/notification-sender.controller';
import { NotificationSenderService } from '../domain-services/notification-sender.service';
import { BullModule } from '@nestjs/bull';
import { LoggedSubscriptionHandler } from '../application-services/event-handlers/subscription/logged-subscription.handler';
import { NotificationEventSubscriber } from './event-subscribers/subscription.subscriber';
import { EmailModule } from './email/email.module';
import { SUBSCRIPTION_EVENT_GROUP } from '@shared/event-bus/domain-services/subscription/subscription.event';
import { EventBusModule } from '@shared/event-bus/infrastructure/event-bus.module';
import { AbstractSubscriptionHandler } from '@notification-sender/application-services/event-handlers/subscription/subscription-handler.interface';

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
      name: SUBSCRIPTION_EVENT_GROUP,
    }),
    EmailModule,
    EventBusModule,
  ],
  controllers: [NotificationSenderController],
  providers: [
    NotificationSenderService,
    LoggedSubscriptionHandler,
    {
      provide: AbstractSubscriptionHandler,
      useClass: LoggedSubscriptionHandler,
    },
    NotificationEventSubscriber,
  ],
})
export class NotificationSenderModule {}
