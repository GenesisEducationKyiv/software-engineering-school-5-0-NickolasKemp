import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/infrastructure/logger';
import { WeatherData } from '../domain/weather.interface';
import { AbstractWeatherService } from '@weather/domain-services/weather.interface';
import { WeatherService } from '../domain-services/weather.service';
import { CacheService } from '@shared/infrastructure/cache/cache.service';
import { MetricsService } from '@shared/infrastructure/metrics/metrics.service';

@Injectable()
export class CachedWeatherService implements AbstractWeatherService {
  private readonly logger = new Logger(CachedWeatherService.name);

  constructor(
    private readonly weatherService: WeatherService,
    private readonly cacheService: CacheService,
    private readonly metricsService: MetricsService,
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = await this.cacheService.get<WeatherData>(cacheKey);

    if (cached) {
      this.logger.log(`Cache hit for city: ${city}`);
      this.metricsService.recordCacheHit();
      return cached;
    }

    this.logger.log(`Cache miss for city: ${city}`);
    this.metricsService.recordCacheMiss();
    const data = await this.weatherService.getWeather(city);
    await this.cacheService.set(cacheKey, data, 300);
    return data;
  }
}
