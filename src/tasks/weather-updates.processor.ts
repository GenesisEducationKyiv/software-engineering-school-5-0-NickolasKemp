import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../email/email.service';
import { WeatherUpdateJob } from '../interfaces/task.interface';
import { AbstractWeatherService } from '../interfaces/weather.interface';
import { getErrorStack } from '../utils/error.utils';

@Processor('weather-updates')
export class WeatherUpdatesProcessor {
  private readonly logger = new Logger(WeatherUpdatesProcessor.name);

  constructor(
    @Inject(AbstractWeatherService) private readonly weatherService: AbstractWeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Process()
  async processWeatherUpdate(job: Job<WeatherUpdateJob>): Promise<void> {
    const { email, city, token, appUrl } = job.data;
    this.logger.log(`Processing weather update for ${email}, city: ${city}`);

    try {
      const weather = await this.weatherService.getWeather(city);
      await this.emailService.sendWeatherUpdate(email, {
        city,
        weather,
        unsubscribeToken: token,
        appUrl,
      });
      this.logger.log(`Weather update email sent to ${email} for ${city}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to process weather update for ${email}, city: ${city}`,
        getErrorStack(error),
      );
      throw error;
    }
  }
}
