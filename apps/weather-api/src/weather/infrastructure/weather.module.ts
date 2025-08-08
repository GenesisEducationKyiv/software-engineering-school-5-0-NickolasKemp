import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherController } from '../application-services/weather.controller';
import { WeatherService } from '../domain-services/weather.service';
import { WeatherClient } from '../application-services/weather-client';
import { WeatherLogger } from './weather-logger';
import { WeatherUrlBuilderService } from './weather-providers/weather-url-builder.service';
import { WeatherApiProvider } from './weather-providers/weather-api.provider';
import { OpenWeatherMapProvider } from './weather-providers/openweathermap.provider';
import { CachedWeatherService } from './cached-weather.service';
import { CacheModule } from '../../../../../shared/src/infrastructure/cache/cache.module';
import { MetricsService } from '../../../../../shared/src/infrastructure/metrics/metrics.service';
import { WeatherProvider } from '@weather/domain-services/weather.interface';
import { AbstractWeatherService } from '@weather/domain-services/weather.interface';
import { WeatherFacade } from '../facade/weather.facade';

@Module({
  imports: [ConfigModule, CacheModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    CachedWeatherService,
    WeatherFacade,
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
      provide: 'WEATHER_PROVIDERS',
      useFactory: (
        weatherApiProvider: WeatherApiProvider,
        openWeatherMapProvider: OpenWeatherMapProvider,
      ) => [weatherApiProvider, openWeatherMapProvider],
      inject: [WeatherApiProvider, OpenWeatherMapProvider],
    },
    {
      provide: WeatherClient,
      useFactory: (providers: WeatherProvider[]) => new WeatherClient(providers),
      inject: ['WEATHER_PROVIDERS'],
    },
  ],
  exports: [AbstractWeatherService, WeatherFacade],
})
export class WeatherModule {}
