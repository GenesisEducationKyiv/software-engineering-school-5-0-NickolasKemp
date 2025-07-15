import { Module } from '@nestjs/common';
import { NotificationSenderController } from './notification-sender.controller';
import { NotificationSenderService } from './notification-sender.service';

@Module({
  imports: [],
  controllers: [NotificationSenderController],
  providers: [NotificationSenderService],
})
export class NotificationSenderModule {}
