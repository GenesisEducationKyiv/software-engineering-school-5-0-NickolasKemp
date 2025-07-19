import { Module } from '@nestjs/common';
import { NotificationSenderController } from './notification-sender.controller';
import { NotificationSenderService } from './notification-sender.service';
import { BullModule } from '@nestjs/bull';
import { WeatherUpdatesProcessor } from './application-services/notification-processors/weather-updates.processor';
import { WeatherHttpService } from './infrastructure/weather/weather-http.service';
import { EmailModule } from './infrastructure/email.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
    EmailModule,
  ],
  controllers: [NotificationSenderController],
  providers: [NotificationSenderService, WeatherUpdatesProcessor, WeatherHttpService],
})
export class NotificationSenderModule {}
