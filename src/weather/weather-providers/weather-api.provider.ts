import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  WeatherData,
  WeatherApiResponse,
  WeatherProvider,
} from '../../interfaces/weather.interface';
import { WeatherLogger } from '../weather-logger';

@Injectable()
export class WeatherApiProvider implements WeatherProvider {
  public readonly name = 'weatherapi.com';
  private readonly logger = new Logger(WeatherApiProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly weatherLogger: WeatherLogger,
  ) {}

  async fetchWeatherData(city: string): Promise<WeatherData> {
    try {
      const apiKey = this.configService.get<string>('WEATHER_API_KEY');
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

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
      throw error;
    }
  }
}
