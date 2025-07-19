import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Logger } from '@shared/infrastructure/logger';
import { EmailSender } from '@notification-sender/domain-services/email-sender.interface';
import { WeatherHttpService } from '@notification-sender/infrastructure/weather/weather-http.service';
import { WeatherUpdateDto } from '@notification-sender/application-services/dto/weather-update.dto';

@Processor('weather-updates')
export class WeatherUpdatesProcessor {
  private readonly logger = new Logger(WeatherUpdatesProcessor.name);

  constructor(
    @Inject(WeatherHttpService) private readonly weatherService: WeatherHttpService,
    private readonly emailSender: EmailSender,
  ) {}

  @Process()
  async processWeatherUpdate(job: Job<WeatherUpdateDto>): Promise<void> {
    const { email, city, token, appUrl } = job.data;
    this.logger.log(`Processing weather update for ${email}, city: ${city}`);

    try {
      const weather = await this.weatherService.getWeather(city);
      await this.emailSender.sendWeatherUpdate(email, {
        city,
        weather,
        unsubscribeToken: token,
        appUrl,
      });
      this.logger.log(`Weather update email sent to ${email} for ${city}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to process weather update for ${email}, city: ${city}`, error);
      throw error;
    }
  }
}
