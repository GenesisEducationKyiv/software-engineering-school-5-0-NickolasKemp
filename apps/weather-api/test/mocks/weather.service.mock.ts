import { Injectable } from '@nestjs/common';
import { WeatherData } from '../../src/weather/domain/weather.interface';
import { AbstractWeatherService } from '@weather/domain-services/weather.interface';

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
