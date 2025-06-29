import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherApiClient } from './weather-api.client';

describe('WeatherService', () => {
  let weatherService: WeatherService;

  const mockWeatherApiClient = {
    fetchWeatherData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: WeatherApiClient,
          useValue: mockWeatherApiClient,
        },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(weatherService).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      const city = 'London';
      const mockWeatherData = {
        current: {
          temp_c: 20,
          humidity: 65,
          condition: {
            text: 'Partly cloudy',
          },
        },
      };

      mockWeatherApiClient.fetchWeatherData.mockResolvedValue(mockWeatherData);

      const result = await weatherService.getWeather(city);

      expect(mockWeatherApiClient.fetchWeatherData).toHaveBeenCalledWith(city);
      expect(result).toEqual({
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      });
    });

    it('should handle errors from the weather API client', async () => {
      const city = 'InvalidCity';
      mockWeatherApiClient.fetchWeatherData.mockRejectedValue(new Error('API Error'));

      await expect(weatherService.getWeather(city)).rejects.toThrow('API Error');
    });
  });
});
