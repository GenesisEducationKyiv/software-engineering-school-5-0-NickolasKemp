import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { AbstractWeatherMetrics } from '../domain-services/weather-metrics.interface';

@Injectable()
export class WeatherMetricsService implements AbstractWeatherMetrics {
  private readonly cacheHitCounter = new Counter({
    name: 'weather_cache_hit_total',
    help: 'Total number of weather cache hits',
  });

  private readonly cacheMissCounter = new Counter({
    name: 'weather_cache_miss_total',
    help: 'Total number of weather cache misses',
  });

  private readonly weatherProviderCallsCounter = new Counter({
    name: 'weather_provider_calls_total',
    help: 'Total number of weather provider API calls',
    labelNames: ['provider', 'status'],
  });

  recordCacheHit(): void {
    this.cacheHitCounter.inc();
  }

  recordCacheMiss(): void {
    this.cacheMissCounter.inc();
  }

  recordWeatherProviderCall(provider: string, status: 'success' | 'error'): void {
    this.weatherProviderCallsCounter.inc({ provider, status });
  }
}
