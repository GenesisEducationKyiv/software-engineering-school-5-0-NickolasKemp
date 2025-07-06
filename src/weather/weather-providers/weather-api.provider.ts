import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import {
  WeatherData,
  WeatherApiResponse,
  WeatherProvider,
} from '../../interfaces/weather.interface';
import { WeatherLogger } from '../weather-logger';
import { WeatherUrlBuilderService } from '../weather-url-builder.service';
import { Logger } from 'src/infrastructure/logger';

@Injectable()
export class WeatherApiProvider implements WeatherProvider {
  public readonly name = 'weatherapi.com';
  private readonly logger = new Logger(WeatherApiProvider.name);
  private readonly baseUrl = 'http://api.weatherapi.com/v1/current.json';

  constructor(
    @Inject('WEATHER_API_KEY') private readonly apiKey: string,
    private readonly weatherUrlBuilderService: WeatherUrlBuilderService,
    private readonly weatherLogger: WeatherLogger,
  ) {}

  async fetchWeatherData(city: string): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        throw new Error('WEATHER_API_KEY is not configured');
      }

      const url = this.weatherUrlBuilderService.buildUrl(this.baseUrl, {
        key: this.apiKey,
        q: city,
      });

      const response = await axios.get<WeatherApiResponse>(url);
      this.weatherLogger.logProviderResponse(this.name, city, response.data);
      return {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
      };
    } catch (error) {
      this.weatherLogger.logProviderResponse(this.name, city, error as Error, true);
      this.logger.error(`Failed to fetch weather data for city: ${city}`, error);
      throw error;
    }
  }
}
