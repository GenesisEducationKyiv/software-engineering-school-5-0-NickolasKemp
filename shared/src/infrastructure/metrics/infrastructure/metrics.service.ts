import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { AbstractHttpMetrics } from '../domain/http-metrics.interface';

@Injectable()
export class MetricsService extends AbstractHttpMetrics {
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

  recordHttpRequest(endpoint: string, method: string, status: number): void {
    this.httpRequestsCounter.inc({ endpoint, method, status: status.toString() });
  }

  recordHttpRequestDuration(endpoint: string, method: string, duration: number): void {
    this.httpRequestDuration.observe({ endpoint, method }, duration);
  }
}
