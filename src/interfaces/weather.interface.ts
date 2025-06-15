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
