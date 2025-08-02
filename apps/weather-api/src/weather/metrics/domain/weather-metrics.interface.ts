export abstract class AbstractWeatherMetrics {
  abstract recordCacheHit(): void;
  abstract recordCacheMiss(): void;
  abstract recordWeatherProviderCall(provider: string, status: 'success' | 'error'): void;
}
