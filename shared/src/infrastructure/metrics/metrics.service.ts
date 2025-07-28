import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['endpoint', 'method', 'status'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['endpoint', 'method'],
  });

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

  private readonly emailSentCounter = new Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['status'],
  });

  recordHttpRequest(endpoint: string, method: string, status: number) {
    this.httpRequestsCounter.inc({ endpoint, method, status: status.toString() });
  }

  recordHttpRequestDuration(endpoint: string, method: string, duration: number) {
    this.httpRequestDuration.observe({ endpoint, method }, duration);
  }

  recordCacheHit() {
    this.cacheHitCounter.inc();
  }

  recordCacheMiss() {
    this.cacheMissCounter.inc();
  }

  recordWeatherProviderCall(provider: string, status: 'success' | 'error') {
    this.weatherProviderCallsCounter.inc({ provider, status });
  }

  recordEmailSent(status: 'success' | 'invalid_email' | 'server_error') {
    this.emailSentCounter.inc({ status });
  }
}
