import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherApiClient } from './weather-api.client';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherApiClient],
  exports: [WeatherService],
})
export class WeatherModule {}
