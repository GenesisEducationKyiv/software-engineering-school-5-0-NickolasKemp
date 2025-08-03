export abstract class AbstractHttpMetrics {
  abstract recordHttpRequest(endpoint: string, method: string, status: number): void;
  abstract recordHttpRequestDuration(endpoint: string, method: string, duration: number): void;
}
