import { Controller, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { WeatherData } from '../domain/weather.interface';
import { AbstractWeatherService } from '@weather/domain-services/weather.interface';
import { Logger } from '@shared/infrastructure/logger';

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
