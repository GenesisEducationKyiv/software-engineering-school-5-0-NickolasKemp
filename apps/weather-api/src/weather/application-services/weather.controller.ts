import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WeatherData } from '../domain/weather.interface';
import { AbstractWeatherService } from '@weather/domain-services/weather.interface';
import { Logger } from '@shared/infrastructure/logger';
import { AbstractHttpMetrics } from '@shared/infrastructure/metrics/domain-services/http-metrics.interface';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(
    private readonly weatherService: AbstractWeatherService,
    @Inject(AbstractHttpMetrics) private readonly httpMetrics: AbstractHttpMetrics,
  ) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<WeatherData> {
    const startTime = Date.now();

    if (!city) {
      this.httpMetrics.recordHttpRequest('/api/weather', 'GET', 400);
      throw new BadRequestException('City is required');
    }

    try {
      const result = await this.weatherService.getWeather(city);

      const duration = (Date.now() - startTime) / 1000;
      this.httpMetrics.recordHttpRequest('/api/weather', 'GET', 200);
      this.httpMetrics.recordHttpRequestDuration('/api/weather', 'GET', duration);

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.httpMetrics.recordHttpRequest('/api/weather', 'GET', 404);
      this.httpMetrics.recordHttpRequestDuration('/api/weather', 'GET', duration);

      this.logger.error(`Error fetching weather for city: ${city}`, error);
      throw new NotFoundException('City not found or weather service unavailable');
    }
  }
}
