import { Injectable } from '@nestjs/common';
import { WeatherData, AbstractWeatherService } from '../../src/interfaces/weather.interface';

@Injectable()
export class MockWeatherService implements AbstractWeatherService {
  getWeather(): Promise<WeatherData> {
    return Promise.resolve({
      temperature: 21,
      humidity: 65,
      description: 'Sunny',
    });
  }
}
