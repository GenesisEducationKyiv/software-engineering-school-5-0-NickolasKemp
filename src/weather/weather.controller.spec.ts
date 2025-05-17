import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-api-key'),
          },
        },
      ],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(weatherController).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      const city = 'London';
      const expectedResult = {
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      };
      jest.spyOn(weatherService, 'getWeather').mockResolvedValue(expectedResult);

      const result = await weatherController.getWeather(city);

      expect(result).toBe(expectedResult);
      expect(weatherService.getWeather).toHaveBeenCalledWith(city);
    });

    it('should throw BadRequestException if city is not provided', async () => {
      await expect(weatherController.getWeather('' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if weather service throws an error', async () => {
      const city = 'InvalidCity';
      jest.spyOn(weatherService, 'getWeather').mockRejectedValue(new Error('API Error'));

      await expect(weatherController.getWeather(city)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
