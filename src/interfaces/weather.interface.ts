export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

export interface WeatherApiResponse {
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
    };
  };
}

export interface OpenWeatherMapResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
}

export interface WeatherHandler {
  setNext(handler: WeatherHandler): WeatherHandler;
  fetchWeatherData(city: string): Promise<WeatherData | null>;
}

export abstract class BaseWeatherHandler implements WeatherHandler {
  protected nextHandler: WeatherHandler | null = null;

  setNext(handler: WeatherHandler): WeatherHandler {
    this.nextHandler = handler;
    return handler;
  }

  async fetchWeatherData(city: string): Promise<WeatherData | null> {
    if (this.nextHandler) {
      return this.nextHandler.fetchWeatherData(city);
    }
    return null;
  }
}

export abstract class AbstractWeatherService {
  abstract getWeather(city: string): Promise<WeatherData>;
}
