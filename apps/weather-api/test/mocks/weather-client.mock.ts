import { WeatherData } from 'src/weather/domain/weather.interface';

export const mockWeatherClient = {
  fetchWeatherData: jest.fn().mockResolvedValue({
    temperature: 20,
    humidity: 65,
    description: 'Mocked Weather',
  } as WeatherData),
};
