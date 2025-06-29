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

export interface WeatherProvider {
  name: string;
  fetchWeatherData(city: string): Promise<WeatherData>;
}

export interface WeatherService {
  getWeather(city: string): Promise<WeatherData>;
}
