import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../application-services/email-sender';
import { EmailSender } from '../domain-services/email-sender.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailSender,
      useClass: EmailService,
    },
  ],
  exports: [EmailSender],
})
export class EmailModule {}
