import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeatherService } from '../src/weather/weather.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'WEATHER_API_KEY') return 'test-api-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call weather API with correct parameters', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        current: {
          temp_c: 22,
          humidity: 75,
          condition: {
            text: 'Partly cloudy',
          },
        },
      },
    });

    const city = 'London';
    await service.getWeather(city);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://api.weatherapi.com/v1/current.json?key=test-api-key&q=${city}`,
    );
  });

  it('should transform API response to expected format', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        current: {
          temp_c: 22,
          humidity: 75,
          condition: {
            text: 'Partly cloudy',
          },
        },
      },
    });

    const result = await service.getWeather('London');

    expect(result).toEqual({
      temperature: 22,
      humidity: 75,
      description: 'Partly cloudy',
    });
  });

  it('should propagate errors from the API', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

    await expect(service.getWeather('InvalidCity')).rejects.toThrow('API error');
  });
}); 