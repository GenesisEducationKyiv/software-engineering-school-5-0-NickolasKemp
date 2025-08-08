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
