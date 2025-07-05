import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { WeatherData } from '../interfaces/weather.interface';

describe('WeatherService', () => {
  let weatherService: WeatherService;

  const mockWeatherClient = {
    fetchWeatherData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: WeatherClient,
          useValue: mockWeatherClient,
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
      const mockWeatherData: WeatherData = {
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      };

      mockWeatherClient.fetchWeatherData.mockResolvedValue(mockWeatherData);

      const result = await weatherService.getWeather(city);

      expect(mockWeatherClient.fetchWeatherData).toHaveBeenCalledWith(city);
      expect(result).toEqual({
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      });
    });

    it('should handle errors from the weather client', async () => {
      const city = 'InvalidCity';
      mockWeatherClient.fetchWeatherData.mockRejectedValue(new Error('API Error'));

      await expect(weatherService.getWeather(city)).rejects.toThrow('API Error');
    });
  });
});
