import { Injectable, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import {
  WeatherData,
  OpenWeatherMapResponse,
  BaseWeatherHandler,
} from '../../interfaces/weather.interface';
import { WeatherLogger } from '../weather-logger';
import { WeatherUrlBuilderService } from '../weather-url-builder.service';

@Injectable()
export class OpenWeatherMapProvider extends BaseWeatherHandler {
  public readonly name = 'openweathermap.org';
  private readonly logger = new Logger(OpenWeatherMapProvider.name);
  private readonly baseUrl = 'http://api.openweathermap.org/data/2.5/weather';

  constructor(
    @Inject('OPENWEATHER_API_KEY') private readonly apiKey: string,
    private readonly weatherUrlBuilderService: WeatherUrlBuilderService,
    private readonly weatherLogger: WeatherLogger,
  ) {
    super();
  }

  async fetchWeatherData(city: string): Promise<WeatherData | null> {
    try {
      if (!this.apiKey) {
        throw new Error('OPENWEATHER_API_KEY is not configured');
      }

      const url = this.weatherUrlBuilderService.buildUrl(this.baseUrl, {
        q: city,
        appid: this.apiKey,
        units: 'metric',
      });
      const response = await axios.get<OpenWeatherMapResponse>(url);
      this.weatherLogger.logProviderResponse(this.name, city, response.data);
      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        description: response.data.weather[0]?.description || 'Unknown',
      };
    } catch (error) {
      this.weatherLogger.logProviderResponse(this.name, city, error, true);
      this.logger.error(`Failed to fetch weather data for city: ${city}`, error.stack);
      return super.fetchWeatherData(city);
    }
  }
}
