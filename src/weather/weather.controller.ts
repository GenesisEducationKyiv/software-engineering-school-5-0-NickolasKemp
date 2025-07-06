import { Controller, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { AbstractWeatherService, WeatherData } from '../interfaces/weather.interface';
import { Logger } from 'src/infrastructure/logger';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: AbstractWeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<WeatherData> {
    if (!city) {
      throw new BadRequestException('City is required');
    }

    try {
      return await this.weatherService.getWeather(city);
    } catch (error) {
      this.logger.error(`Error fetching weather for city: ${city}`, error);
      throw new NotFoundException('City not found or weather service unavailable');
    }
  }
}
