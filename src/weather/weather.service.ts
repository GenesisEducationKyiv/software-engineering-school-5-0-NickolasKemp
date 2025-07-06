import { Injectable } from '@nestjs/common';
import { WeatherData, AbstractWeatherService } from '../interfaces/weather.interface';
import { WeatherClient } from './weather-client';
import { Logger } from 'src/infrastructure/logger';

@Injectable()
export class WeatherService implements AbstractWeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly weatherClient: WeatherClient) {}

  async getWeather(city: string): Promise<WeatherData> {
    try {
      throw Error('TEST');

      return await this.weatherClient.fetchWeatherData(city);
    } catch (error) {
      this.logger.error(`Failed to process weather data for city: ${city}`, error);
      throw error;
    }
  }
}
