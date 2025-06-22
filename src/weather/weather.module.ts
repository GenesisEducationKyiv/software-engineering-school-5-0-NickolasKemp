import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { WeatherLogger } from './weather-logger';
import { WeatherApiProvider } from './weather-providers/weather-api.provider';
import { OpenWeatherMapProvider } from './weather-providers/openweathermap.provider';

@Module({
  imports: [ConfigModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherClient,
    WeatherLogger,
    WeatherApiProvider,
    OpenWeatherMapProvider,
    {
      provide: 'WEATHER_PROVIDERS',
      useFactory: (
        weatherApiProvider: WeatherApiProvider,
        openWeatherMapProvider: OpenWeatherMapProvider,
      ) => [weatherApiProvider, openWeatherMapProvider],
      inject: [WeatherApiProvider, OpenWeatherMapProvider],
    },
    {
      provide: WeatherClient,
      useFactory: (providers: any[]) => new WeatherClient(providers),
      inject: ['WEATHER_PROVIDERS'],
    },
  ],
  exports: [WeatherService],
})
export class WeatherModule {}
