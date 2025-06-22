import { Injectable, Logger } from '@nestjs/common';
import { WeatherProvider, WeatherData } from '../interfaces/weather.interface';

@Injectable()
export class WeatherClient {
  private readonly logger = new Logger(WeatherClient.name);

  constructor(private readonly providers: WeatherProvider[]) {}

  async fetchWeatherData(city: string): Promise<WeatherData> {
    for (const provider of this.providers) {
      try {
        this.logger.log(`Trying provider: ${provider.name} for city: ${city}`);
        const data = await provider.fetchWeatherData(city);
        this.logger.log(`Successfully fetched weather data from ${provider.name}`);
        return data;
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed for city: ${city}`, error.stack);
      }
    }

    this.logger.error(`All providers failed for city: ${city}`);
    throw new Error(`All weather providers failed for city: ${city}`);
  }
}
