import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('api')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    await this.subscriptionService.subscribe(createSubscriptionDto);

    return { message: 'Subscription successful. Confirmation email sent.' };
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    await this.subscriptionService.confirm(token);

    return { message: 'Subscription confirmed successfully' };
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    await this.subscriptionService.unsubscribe(token);

    return { message: 'Unsubscribed successfully' };
  }
}
