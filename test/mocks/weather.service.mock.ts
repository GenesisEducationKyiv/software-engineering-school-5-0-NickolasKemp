import { Injectable } from '@nestjs/common';
import { WeatherData } from '../../src/weather/weather.service';

@Injectable()
export class MockWeatherService {
  getWeather(): Promise<WeatherData> {
    return Promise.resolve({
      temperature: 21,
      humidity: 65,
      description: 'Sunny',
    });
  }
}
