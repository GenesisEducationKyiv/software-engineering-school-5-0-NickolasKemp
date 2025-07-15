import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationSenderService {
  getHello(): string {
    return 'Hello World!';
  }
}
