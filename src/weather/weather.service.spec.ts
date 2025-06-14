import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherService } from './weather.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let weatherService: WeatherService;

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

    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(weatherService).toBeDefined();
  });

  describe('getWeather', () => {
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
      await weatherService.getWeather(city);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://api.weatherapi.com/v1/current.json?key=test-api-key&q=${city}`,
      );
    });

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

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(`q=${city}`));
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
