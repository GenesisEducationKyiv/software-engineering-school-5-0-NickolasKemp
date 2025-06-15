import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherApiResponse } from '../interfaces/weather.interface';

@Injectable()
export class WeatherApiClient {
  private readonly logger = new Logger(WeatherApiClient.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchWeatherData(city: string): Promise<WeatherApiResponse> {
    try {
      const apiKey = this.configService.get<string>('WEATHER_API_KEY');
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

      const response = await axios.get<WeatherApiResponse>(url);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch weather data for city: ${city}`, error.stack);
      throw error;
    }
  }
}
