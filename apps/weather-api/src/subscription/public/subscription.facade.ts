import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbstractSubscriptionRepository } from '../domain-services/interfaces/subscription.interface';
import { Subscription } from '../domain/subscription.interface';
import { NotificationService } from '../domain-services/notification.service';

@Injectable()
export class SubscriptionFacade {
  constructor(
    @Inject(AbstractSubscriptionRepository)
    private readonly subscriptionRepository: AbstractSubscriptionRepository,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async getConfirmedSubscriptionsByFrequency(frequency: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findManyConfirmedByFrequency(frequency);
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    await this.notificationService.sendSubscriptionConfirmation(email, {
      token,
      appUrl: this.configService.get<string>('APP_URL') || 'http://localhost:3000',
    });
  }
}
