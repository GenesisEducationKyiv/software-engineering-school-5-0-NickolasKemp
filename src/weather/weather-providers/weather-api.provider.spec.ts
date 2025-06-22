import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherApiProvider } from './weather-api.provider';
import { WeatherLogger } from '../weather-logger';
import { WeatherApiResponse, WeatherData } from '../../interfaces/weather.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherApiProvider', () => {
  let service: WeatherApiProvider;
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
        WeatherApiProvider,
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

    service = module.get<WeatherApiProvider>(WeatherApiProvider);
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
    expect(service.name).toBe('weatherapi.com');
  });

  describe('fetchWeatherData', () => {
    it('should fetch weather data successfully', async () => {
      const city = 'London';
      const apiKey = 'test-api-key';
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

      configService.get.mockReturnValue(apiKey);
      mockedAxios.get.mockResolvedValue({ data: apiResponse });

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedResponse);
      expect(configService.get).toHaveBeenCalledWith('WEATHER_API_KEY');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`,
      );
      expect(weatherLogger.logProviderResponse).toHaveBeenCalledWith(
        'weatherapi.com',
        city,
        apiResponse,
      );
    });

    it('should handle API errors', async () => {
      const city = 'London';
      const apiKey = 'test-api-key';
      const error = new Error('API Error');

      configService.get.mockReturnValue(apiKey);
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
