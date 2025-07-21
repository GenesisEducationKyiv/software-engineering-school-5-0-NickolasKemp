import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationSenderController } from './notification-sender.controller';
import { NotificationSenderService } from './notification-sender.service';
import { BullModule } from '@nestjs/bull';
import { WeatherUpdatesProcessor } from './application-services/notification-processors/weather-updates.processor';
import { NotificationProcessor } from './application-services/event-processors/notification.processor';
import { WeatherHttpService } from './infrastructure/weather/weather-http.service';
import { EmailModule } from './infrastructure/email.module';

@Module({
  imports: [
    ConfigModule,
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
      name: 'weather-updates',
    }),
    BullModule.registerQueue({
      name: 'events',
    }),
    EmailModule,
  ],
  controllers: [NotificationSenderController],
  providers: [
    NotificationSenderService,
    WeatherUpdatesProcessor,
    NotificationProcessor,
    WeatherHttpService,
  ],
})
export class NotificationSenderModule {}
