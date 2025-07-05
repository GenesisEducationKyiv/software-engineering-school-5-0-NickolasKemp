import { Injectable, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import {
  WeatherData,
  WeatherApiResponse,
  BaseWeatherHandler,
} from '../../interfaces/weather.interface';
import { WeatherLogger } from '../weather-logger';
import { WeatherUrlBuilderService } from '../weather-url-builder.service';

@Injectable()
export class WeatherApiProvider extends BaseWeatherHandler {
  public readonly name = 'weatherapi.com';
  private readonly logger = new Logger(WeatherApiProvider.name);
  private readonly baseUrl = 'http://api.weatherapi.com/v1/current.json';

  constructor(
    @Inject('WEATHER_API_KEY') private readonly apiKey: string,
    private readonly weatherUrlBuilderService: WeatherUrlBuilderService,
    private readonly weatherLogger: WeatherLogger,
  ) {
    super();
  }

  async fetchWeatherData(city: string): Promise<WeatherData | null> {
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
      this.weatherLogger.logProviderResponse(this.name, city, error, true);
      this.logger.error(`Failed to fetch weather data for city: ${city}`, error.stack);
      return super.fetchWeatherData(city);
    }
  }
}
