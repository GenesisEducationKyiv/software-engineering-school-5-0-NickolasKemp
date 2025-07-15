import { Controller, Get } from '@nestjs/common';
import { NotificationSenderService } from './notification-sender.service';

@Controller()
export class NotificationSenderController {
  constructor(private readonly notificationSenderService: NotificationSenderService) {}

  @Get()
  getHello(): string {
    return this.notificationSenderService.getHello();
  }
}
