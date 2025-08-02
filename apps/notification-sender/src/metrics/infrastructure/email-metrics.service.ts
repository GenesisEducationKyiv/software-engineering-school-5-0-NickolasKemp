import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { AbstractEmailMetrics } from '../domain/email-metrics.interface';

@Injectable()
export class EmailMetricsService implements AbstractEmailMetrics {
  private readonly emailSentCounter = new Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['status'],
  });

  recordEmailSent(status: 'success' | 'invalid_email' | 'server_error'): void {
    this.emailSentCounter.inc({ status });
  }
}
