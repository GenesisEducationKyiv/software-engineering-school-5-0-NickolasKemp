import { WeatherData } from 'src/interfaces/weather.interface';

export const mockWeatherClient = {
  fetchWeatherData: jest.fn().mockResolvedValue({
    temperature: 20,
    humidity: 65,
    description: 'Mocked Weather',
  } as WeatherData),
};
