import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  WeatherService as WeatherServiceInterface,
  WeatherData,
} from '../interfaces/weather.interface';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(@Inject('WeatherService') private readonly weatherService: WeatherServiceInterface) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<WeatherData> {
    if (!city) {
      throw new BadRequestException('City is required');
    }

    try {
      return await this.weatherService.getWeather(city);
    } catch (error) {
      this.logger.error(`Error fetching weather for city: ${city}`, error.stack);
      throw new NotFoundException('City not found or weather service unavailable');
    }
  }
}
