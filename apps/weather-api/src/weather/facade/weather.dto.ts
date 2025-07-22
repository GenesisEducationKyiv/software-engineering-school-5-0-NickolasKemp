export interface GetWeatherDto {
  city: string;
}

export interface WeatherResponseDto {
  temperature: number;
  humidity: number;
  description: string;
}
