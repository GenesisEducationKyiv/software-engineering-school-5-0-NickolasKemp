import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@shared/infrastructure/logger';
import { WeatherUpdateFacade } from '@subscription/public/weather-update.facade';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly weatherUpdateFacade: WeatherUpdateFacade) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleHourlyUpdates(): Promise<void> {
    this.logger.log('Scheduling hourly weather updates');
    await this.weatherUpdateFacade.sendHourlyWeatherUpdates();
  }

  @Cron('0 8 * * *') // 8 AM daily
  async scheduleDailyUpdates(): Promise<void> {
    this.logger.log('Scheduling daily weather updates');
    await this.weatherUpdateFacade.sendDailyWeatherUpdates();
  }
}
