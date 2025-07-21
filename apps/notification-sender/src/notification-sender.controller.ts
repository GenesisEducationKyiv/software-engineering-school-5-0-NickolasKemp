import { Controller, Post, Body } from '@nestjs/common';
import { NotificationSenderService } from './notification-sender.service';

interface ConfirmationEmailRequest {
  email: string;
  token: string;
  appUrl: string;
}

interface WeatherUpdateEmailRequest {
  email: string;
  city: string;
  weather: any;
  unsubscribeToken: string;
  appUrl: string;
}

@Controller('api/notifications')
export class NotificationSenderController {
  constructor(private readonly notificationSenderService: NotificationSenderService) {}

  @Post('confirmation')
  async sendConfirmationEmail(@Body() data: ConfirmationEmailRequest): Promise<void> {
    await this.notificationSenderService.sendConfirmationEmail(data.email, {
      token: data.token,
      appUrl: data.appUrl,
    });
  }

  @Post('weather-update')
  async sendWeatherUpdateEmail(@Body() data: WeatherUpdateEmailRequest): Promise<void> {
    await this.notificationSenderService.sendWeatherUpdateEmail(data.email, {
      city: data.city,
      weather: data.weather,
      unsubscribeToken: data.unsubscribeToken,
      appUrl: data.appUrl,
    });
  }
}
