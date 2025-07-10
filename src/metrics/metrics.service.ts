import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly cacheHitCounter = new Counter({
    name: 'weather_cache_hit_total',
    help: 'Total number of weather cache hits',
  });
  private readonly cacheMissCounter = new Counter({
    name: 'weather_cache_miss_total',
    help: 'Total number of weather cache misses',
  });

  incHit() {
    this.cacheHitCounter.inc();
  }
  incMiss() {
    this.cacheMissCounter.inc();
  }
}
