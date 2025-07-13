import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailSender } from '../../domain/email.interface';

@Module({
  providers: [
    {
      provide: EmailSender,
      useClass: EmailService,
    },
  ],
  exports: [EmailSender],
})
export class EmailModule {}
