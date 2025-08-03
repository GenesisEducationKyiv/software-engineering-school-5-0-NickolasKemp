import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailSender } from './email-sender';
import { AbstractEmailSender } from '../../domain-services/email-sender.interface';
import { AbstractEmailMetrics } from '../../metrics/domain-services/email-metrics.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AbstractEmailSender,
      useClass: EmailSender,
    },
    EmailSender,
    {
      provide: AbstractEmailMetrics,
      useExisting: AbstractEmailMetrics,
    },
  ],
  exports: [AbstractEmailSender],
})
export class EmailModule {}
