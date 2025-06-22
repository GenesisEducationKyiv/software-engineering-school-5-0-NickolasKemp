import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OpenWeatherMapProvider } from './openweathermap.provider';
import { WeatherLogger } from '../weather-logger';
import { OpenWeatherMapResponse, WeatherData } from '../../interfaces/weather.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenWeatherMapProvider', () => {
  let service: OpenWeatherMapProvider;
  let configService: jest.Mocked<ConfigService>;
  let weatherLogger: jest.Mocked<WeatherLogger>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockWeatherLogger = {
      logProviderResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenWeatherMapProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WeatherLogger,
          useValue: mockWeatherLogger,
        },
      ],
    }).compile();

    service = module.get<OpenWeatherMapProvider>(OpenWeatherMapProvider);
    configService = module.get(ConfigService);
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
      const apiKey = 'test-api-key';
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

      configService.get.mockReturnValue(apiKey);
      mockedAxios.get.mockResolvedValue({ data: openWeatherResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
      expect(configService.get).toHaveBeenCalledWith('OPENWEATHER_API_KEY');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      );
      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'openweathermap.org',
        city,
        openWeatherResponse,
      );
    });

    it('should handle missing weather description', async () => {
      const city = 'London';
      const apiKey = 'test-api-key';
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

      configService.get.mockReturnValue(apiKey);
      mockedAxios.get.mockResolvedValue({ data: openWeatherResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors', async () => {
      const city = 'London';
      const apiKey = 'test-api-key';
      const error = new Error('API Error');

      configService.get.mockReturnValue(apiKey);
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
