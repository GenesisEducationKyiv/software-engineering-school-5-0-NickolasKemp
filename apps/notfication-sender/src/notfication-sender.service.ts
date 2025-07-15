import { Injectable } from '@nestjs/common';

@Injectable()
export class NotficationSenderService {
  getHello(): string {
    return 'Hello World!';
  }
}
