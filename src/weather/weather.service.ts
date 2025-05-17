import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly configService: ConfigService) {}

  async getWeather(city: string): Promise<WeatherData> {
    try {
      const apiKey = this.configService.get<string>('WEATHER_API_KEY');
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
      
      const response = await axios.get(url);
      
      return {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch weather data for city: ${city}`, error.stack);
      throw error;
    }
  }
}
