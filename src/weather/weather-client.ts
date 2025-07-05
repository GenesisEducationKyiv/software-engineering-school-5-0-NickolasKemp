import { Injectable, Logger } from '@nestjs/common';
import { WeatherHandler, WeatherData } from '../interfaces/weather.interface';

@Injectable()
export class WeatherClient {
  private readonly logger = new Logger(WeatherClient.name);

  constructor(private readonly handler: WeatherHandler) {}

  async fetchWeatherData(city: string): Promise<WeatherData> {
    this.logger.log(`Starting weather data fetch chain for city: ${city}`);
    const data = await this.handler.fetchWeatherData(city);
    if (!data) {
      throw new Error(`All weather providers failed for city: ${city}`);
    }
    this.logger.log(`Successfully fetched weather data for city: ${city}`);
    return data;
  }
}
