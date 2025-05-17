import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherService } from './weather.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-api-key'),
          },
        },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(weatherService).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      const city = 'London';
      const mockResponse = {
        data: {
          current: {
            temp_c: 20,
            humidity: 65,
            condition: {
              text: 'Partly cloudy',
            },
          },
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getWeather(city);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`q=${city}`),
      );
      expect(result).toEqual({
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      });
    });

    it('should throw an error if the API call fails', async () => {
      const city = 'InvalidCity';
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(weatherService.getWeather(city)).rejects.toThrow(Error);
    });
  });
});
