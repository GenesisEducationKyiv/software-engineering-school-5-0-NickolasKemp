import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { WeatherApiProvider } from '../infrastructure/weather-providers/weather-api.provider';
import { WeatherLogger } from '../infrastructure/weather-logger';
import { WeatherUrlBuilderService } from '../infrastructure/weather-providers/weather-url-builder.service';
import { WeatherData } from '../domain/weather.interface';
import { WeatherApiResponse } from '@weather/infrastructure/weather-providers/weather-providers.interface';
import { AbstractWeatherMetrics } from '../metrics/domain-services/weather-metrics.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherApiProvider', () => {
  let service: WeatherApiProvider;
  let weatherUrlBuilderService: jest.Mocked<WeatherUrlBuilderService>;
  let weatherLogger: jest.Mocked<WeatherLogger>;

  beforeEach(async () => {
    const mockWeatherUrlBuilderService = {
      buildUrl: jest.fn(),
    };

    const mockWeatherLogger = {
      logProviderResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherApiProvider,
        {
          provide: 'WEATHER_API_KEY',
          useValue: 'test-api-key',
        },
        {
          provide: WeatherUrlBuilderService,
          useValue: mockWeatherUrlBuilderService,
        },
        {
          provide: WeatherLogger,
          useValue: mockWeatherLogger,
        },
        {
          provide: AbstractWeatherMetrics,
          useValue: {
            recordWeatherProviderCall: jest.fn(),
            recordCacheHit: jest.fn(),
            recordCacheMiss: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherApiProvider>(WeatherApiProvider);
    weatherUrlBuilderService = module.get(WeatherUrlBuilderService);
    weatherLogger = module.get(WeatherLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have correct provider name', () => {
    expect(service.name).toBe('weatherapi.com');
  });

  describe('fetchWeatherData', () => {
    it('should fetch weather data successfully', async () => {
      const city = 'London';
      const url = 'http://api.weatherapi.com/v1/current.json?key=test-api-key&q=London';
      const apiResponse: WeatherApiResponse = {
        current: {
          temp_c: 20,
          humidity: 60,
          condition: {
            text: 'Sunny',
          },
        },
      };

      const expectedResponse: WeatherData = {
        temperature: 20,
        humidity: 60,
        description: 'Sunny',
      };

      weatherUrlBuilderService.buildUrl.mockReturnValue(url);
      mockedAxios.get.mockResolvedValue({ data: apiResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
      expect(weatherUrlBuilderService.buildUrl).toHaveBeenCalledWith(
        'http://api.weatherapi.com/v1/current.json',
        {
          key: 'test-api-key',
          q: city,
        },
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(url);
      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'weatherapi.com',
        city,
        apiResponse,
      );
    });

    it('should handle API errors', async () => {
      const city = 'London';
      const url = 'http://api.weatherapi.com/v1/current.json?key=test-api-key&q=London';
      const error = new Error('API Error');

      weatherUrlBuilderService.buildUrl.mockReturnValue(url);
      mockedAxios.get.mockRejectedValue(error);

      await expect(service.fetchWeatherData(city)).rejects.toThrow('API Error');

      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'weatherapi.com',
        city,
        error,
        true,
      );
    });
  });
});
