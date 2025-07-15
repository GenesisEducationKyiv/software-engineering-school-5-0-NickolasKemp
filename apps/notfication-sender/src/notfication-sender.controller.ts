import { Controller, Get } from '@nestjs/common';
import { NotficationSenderService } from './notfication-sender.service';

@Controller()
export class NotficationSenderController {
  constructor(private readonly notficationSenderService: NotficationSenderService) {}

  @Get()
  getHello(): string {
    return this.notficationSenderService.getHello();
  }
}
