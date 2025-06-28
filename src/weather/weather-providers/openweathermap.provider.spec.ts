import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { OpenWeatherMapProvider } from './openweathermap.provider';
import { WeatherLogger } from '../weather-logger';
import { WeatherUrlBuilderService } from '../weather-url-builder.service';
import { OpenWeatherMapResponse, WeatherData } from '../../interfaces/weather.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenWeatherMapProvider', () => {
  let service: OpenWeatherMapProvider;
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
        OpenWeatherMapProvider,
        {
          provide: 'OPENWEATHER_API_KEY',
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
      ],
    }).compile();

    service = module.get<OpenWeatherMapProvider>(OpenWeatherMapProvider);
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
    expect(service.name).toBe('openweathermap.org');
  });

  describe('fetchWeatherData', () => {
    it('should fetch weather data successfully', async () => {
      const city = 'London';
      const url =
        'http://api.openweathermap.org/data/2.5/weather?q=London&appid=test-api-key&units=metric';
      const openWeatherResponse: OpenWeatherMapResponse = {
        main: {
          temp: 20,
          humidity: 60,
        },
        weather: [
          {
            description: 'sunny',
          },
        ],
      };

      const expectedResponse: WeatherData = {
        temperature: 20,
        humidity: 60,
        description: 'sunny',
      };

      weatherUrlBuilderService.buildUrl.mockReturnValue(url);
      mockedAxios.get.mockResolvedValue({ data: openWeatherResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
      expect(weatherUrlBuilderService.buildUrl).toHaveBeenCalledWith(
        'http://api.openweathermap.org/data/2.5/weather',
        {
          q: city,
          appid: 'test-api-key',
          units: 'metric',
        },
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(url);
      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'openweathermap.org',
        city,
        openWeatherResponse,
      );
    });

    it('should handle missing weather description', async () => {
      const city = 'London';
      const url =
        'http://api.openweathermap.org/data/2.5/weather?q=London&appid=test-api-key&units=metric';
      const openWeatherResponse: OpenWeatherMapResponse = {
        main: {
          temp: 20,
          humidity: 60,
        },
        weather: [],
      };

      const expectedResponse: WeatherData = {
        temperature: 20,
        humidity: 60,
        description: 'Unknown',
      };

      weatherUrlBuilderService.buildUrl.mockReturnValue(url);
      mockedAxios.get.mockResolvedValue({ data: openWeatherResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors', async () => {
      const city = 'London';
      const url =
        'http://api.openweathermap.org/data/2.5/weather?q=London&appid=test-api-key&units=metric';
      const error = new Error('API Error');

      weatherUrlBuilderService.buildUrl.mockReturnValue(url);
      mockedAxios.get.mockRejectedValue(error);

      await expect(service.fetchWeatherData(city)).rejects.toThrow('API Error');

      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'openweathermap.org',
        city,
        error,
        true,
      );
    });
  });
});
