import { WeatherData } from '@weather/domain/weather.interface';

export abstract class AbstractWeatherService {
  abstract getWeather(city: string): Promise<WeatherData>;
}

export interface WeatherProvider {
  name: string;
  fetchWeatherData(city: string): Promise<WeatherData>;
}
