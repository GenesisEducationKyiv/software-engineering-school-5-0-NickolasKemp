import { Injectable } from '@nestjs/common';
import { WeatherData } from '../domain/weather.interface';
import { AbstractWeatherService } from './weather.interface';
import { WeatherClient } from '../application-services/weather-client';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class WeatherService implements AbstractWeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly weatherClient: WeatherClient) {}

  async getWeather(city: string): Promise<WeatherData> {
    try {
      return await this.weatherClient.fetchWeatherData(city);
    } catch (error) {
      this.logger.error(`Failed to process weather data for city: ${city}`, error);
      throw error;
    }
  }
}
