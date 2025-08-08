import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailSender } from './email-sender';
import { AbstractEmailSender } from '../../domain-services/email-sender.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AbstractEmailSender,
      useClass: EmailSender,
    },
    EmailSender,
  ],
  exports: [AbstractEmailSender],
})
export class EmailModule {}
