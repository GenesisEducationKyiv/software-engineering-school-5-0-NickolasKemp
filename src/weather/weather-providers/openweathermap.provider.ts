import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  WeatherData,
  OpenWeatherMapResponse,
  WeatherProvider,
} from '../../interfaces/weather.interface';
import { WeatherLogger } from '../weather-logger';

@Injectable()
export class OpenWeatherMapProvider implements WeatherProvider {
  public readonly name = 'openweathermap.org';
  private readonly logger = new Logger(OpenWeatherMapProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly weatherLogger: WeatherLogger,
  ) {}

  async fetchWeatherData(city: string): Promise<WeatherData> {
    try {
      const apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');
      const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

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
      throw error;
    }
  }
}
