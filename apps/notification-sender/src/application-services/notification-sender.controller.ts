import { Controller, Get } from '@nestjs/common';

@Controller('api/notifications')
export class NotificationSenderController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'Hello World';
  }
}
