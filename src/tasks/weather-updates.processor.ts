import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';

interface WeatherUpdateJob {
  email: string;
  city: string;
  token: string;
  appUrl: string;
}

@Processor('weather-updates')
export class WeatherUpdatesProcessor {
  private readonly logger = new Logger(WeatherUpdatesProcessor.name);

  constructor(
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Process()
  async processWeatherUpdate(job: Job<WeatherUpdateJob>): Promise<void> {
    const { email, city, token, appUrl } = job.data;
    this.logger.log(`Processing weather update for ${email}, city: ${city}`);

    try {
      const weather = await this.weatherService.getWeather(city);
      await this.emailService.sendWeatherUpdate(email, city, weather, token, appUrl);
      this.logger.log(`Weather update email sent to ${email} for ${city}`);
    } catch (error) {
      this.logger.error(
        `Failed to process weather update for ${email}, city: ${city}`,
        error.stack,
      );
      throw error;
    }
  }
}
