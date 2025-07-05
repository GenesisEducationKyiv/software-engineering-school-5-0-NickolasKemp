import { Test, TestingModule } from '@nestjs/testing';
import { WeatherClient } from './weather-client';
import { WeatherHandler, WeatherData } from '../interfaces/weather.interface';

describe('WeatherClient', () => {
  let service: WeatherClient;
  let handler1: jest.Mocked<WeatherHandler>;
  let handler2: jest.Mocked<WeatherHandler>;

  beforeEach(async () => {
    handler1 = {
      setNext: jest.fn(),
      fetchWeatherData: jest.fn(),
    };
    handler2 = {
      setNext: jest.fn(),
      fetchWeatherData: jest.fn(),
    };
    handler1.setNext.mockImplementation(() => handler2);
    handler1.setNext(handler2);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WeatherClient,
          useValue: new WeatherClient(handler1),
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
    it('should return data from first successful handler', async () => {
      const city = 'London';
      const expectedData: WeatherData = {
        temperature: 20,
        humidity: 60,
        description: 'Sunny',
      };
      handler1.fetchWeatherData.mockResolvedValue(expectedData);
      handler2.fetchWeatherData.mockResolvedValue(null);

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedData);
      expect(handler1.fetchWeatherData).toHaveBeenCalledWith(city);
      expect(handler2.fetchWeatherData).not.toHaveBeenCalled();
    });

    it('should try second handler when first returns null', async () => {
      const city = 'London';
      const expectedData: WeatherData = {
        temperature: 18,
        humidity: 55,
        description: 'Cloudy',
      };
      handler1.fetchWeatherData.mockImplementation(async (c) => {
        return handler2.fetchWeatherData(c);
      });
      handler2.fetchWeatherData.mockResolvedValue(expectedData);

      const result = await service.fetchWeatherData(city);

      expect(result).toEqual(expectedData);
      expect(handler1.fetchWeatherData).toHaveBeenCalledWith(city);
      expect(handler2.fetchWeatherData).toHaveBeenCalledWith(city);
    });

    it('should throw error when all handlers return null', async () => {
      const city = 'London';
      handler1.fetchWeatherData.mockResolvedValue(null);

      await expect(service.fetchWeatherData(city)).rejects.toThrow(
        'All weather providers failed for city: London',
      );

      expect(handler1.fetchWeatherData).toHaveBeenCalledWith(city);
    });
  });
});
