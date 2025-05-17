import { Injectable } from '@nestjs/common';
import { WeatherData } from '../../src/weather/weather.service';

@Injectable()
export class MockWeatherService {
  async getWeather(city: string): Promise<WeatherData> {
    return {
      temperature: 21,
      humidity: 65,
      description: 'Sunny',
    };
  }
} 