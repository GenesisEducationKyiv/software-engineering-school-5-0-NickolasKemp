import { Test, TestingModule } from '@nestjs/testing';
import { WeatherClient } from './weather-client';
import { WeatherProvider, WeatherData } from '../interfaces/weather.interface';

describe('WeatherClient', () => {
  let service: WeatherClient;
  let mockProviders: jest.Mocked<WeatherProvider>[];

  beforeEach(async () => {
    mockProviders = [
      {
        name: 'provider1',
        fetchWeatherData: jest.fn(),
      },
      {
        name: 'provider2',
        fetchWeatherData: jest.fn(),
      },
    ] as jest.Mocked<WeatherProvider>[];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WeatherClient,
          useValue: new WeatherClient(mockProviders),
        },
      ],
    }).compile();

    service = module.get<WeatherClient>(WeatherClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchWeatherData', () => {
    it('should return data from first successful provider', async () => {
      const city = 'London';
      const expectedData: WeatherData = {
        temperature: 20,
        humidity: 60,
        description: 'Sunny',
      };

      mockProviders[0].fetchWeatherData.mockResolvedValue(expectedData);

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedData);
      expect(mockProviders[0].fetchWeatherData).toHaveBeenCalledWith(city);
      expect(mockProviders[1].fetchWeatherData).not.toHaveBeenCalled();
    });

    it('should try second provider when first fails', async () => {
      const city = 'London';
      const expectedData: WeatherData = {
        temperature: 18,
        humidity: 55,
        description: 'Cloudy',
      };

      mockProviders[0].fetchWeatherData.mockRejectedValue(new Error('Provider 1 failed'));
      mockProviders[1].fetchWeatherData.mockResolvedValue(expectedData);

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedData);
      expect(mockProviders[0].fetchWeatherData).toHaveBeenCalledWith(city);
      expect(mockProviders[1].fetchWeatherData).toHaveBeenCalledWith(city);
    });

    it('should throw error when all providers fail', async () => {
      const city = 'London';

      mockProviders[0].fetchWeatherData.mockRejectedValue(new Error('Provider 1 failed'));
      mockProviders[1].fetchWeatherData.mockRejectedValue(new Error('Provider 2 failed'));

      await expect(service.fetchWeatherData(city)).rejects.toThrow(
        'All weather providers failed for city: London',
      );

      expect(mockProviders[0].fetchWeatherData).toHaveBeenCalledWith(city);
      expect(mockProviders[1].fetchWeatherData).toHaveBeenCalledWith(city);
    });
  });
});
