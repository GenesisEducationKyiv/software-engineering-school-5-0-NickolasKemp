import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherClient } from './weather-client';
import { WeatherLogger } from './weather-logger';
import { WeatherUrlBuilderService } from './weather-url-builder.service';
import { WeatherApiProvider } from './weather-providers/weather-api.provider';
import { OpenWeatherMapProvider } from './weather-providers/openweathermap.provider';
import { CachedWeatherService } from './cached-weather.service';
import { CacheModule } from '../cache/cache.module';
import { MetricsService } from '../metrics/metrics.service';
import { AbstractWeatherService } from '../interfaces/weather.interface';

@Module({
  imports: [ConfigModule, CacheModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    CachedWeatherService,
    {
      provide: AbstractWeatherService,
      useClass: CachedWeatherService,
    },
    WeatherClient,
    WeatherLogger,
    WeatherUrlBuilderService,
    WeatherApiProvider,
    OpenWeatherMapProvider,
    MetricsService,
    {
      provide: 'OPENWEATHER_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('OPENWEATHER_API_KEY'),
      inject: [ConfigService],
    },
    {
      provide: 'WEATHER_API_KEY',
      useFactory: (configService: ConfigService) => configService.get<string>('WEATHER_API_KEY'),
      inject: [ConfigService],
    },
    {
      provide: WeatherClient,
      useFactory: (
        weatherApiProvider: WeatherApiProvider,
        openWeatherMapProvider: OpenWeatherMapProvider,
      ) => {
        weatherApiProvider.setNext(openWeatherMapProvider);
        return new WeatherClient(weatherApiProvider);
      },
      inject: [WeatherApiProvider, OpenWeatherMapProvider],
    },
  ],
  exports: [AbstractWeatherService],
})
export class WeatherModule {}
