import { WeatherApiResponse } from '../../src/interfaces/weather.interface';

export const mockWeatherApiClient = {
  fetchWeatherData: jest.fn().mockResolvedValue({
    current: {
      temp_c: 20,
      humidity: 65,
      condition: {
        text: 'Partly cloudy',
      },
    },
  } as WeatherApiResponse),
};
