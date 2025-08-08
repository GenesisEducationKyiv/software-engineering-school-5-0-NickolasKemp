export abstract class AbstractEmailMetrics {
  abstract recordEmailSent(status: 'success' | 'invalid_email' | 'server_error'): void;
}
