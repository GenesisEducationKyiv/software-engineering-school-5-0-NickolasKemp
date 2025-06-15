import { Injectable, Logger } from '@nestjs/common';
import { WeatherData } from '../interfaces/weather.interface';
import { WeatherApiClient } from './weather-api.client';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly weatherApiClient: WeatherApiClient) {}

  async getWeather(city: string): Promise<WeatherData> {
    try {
      const weatherData = await this.weatherApiClient.fetchWeatherData(city);

      return {
        temperature: weatherData.current.temp_c,
        humidity: weatherData.current.humidity,
        description: weatherData.current.condition.text,
      };
    } catch (error) {
      this.logger.error(`Failed to process weather data for city: ${city}`, error.stack);
      throw error;
    }
  }
}
