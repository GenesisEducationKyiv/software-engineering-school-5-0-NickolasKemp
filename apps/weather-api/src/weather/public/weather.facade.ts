import { Injectable } from '@nestjs/common';
import { WeatherService } from '../domain-services/weather.service';
import { GetWeatherDto, WeatherResponseDto } from './weather.dto';

@Injectable()
export class WeatherFacade {
  constructor(private readonly weatherService: WeatherService) {}

  async getWeather(getWeatherDto: GetWeatherDto): Promise<WeatherResponseDto> {
    return this.weatherService.getWeather(getWeatherDto.city);
  }
}
