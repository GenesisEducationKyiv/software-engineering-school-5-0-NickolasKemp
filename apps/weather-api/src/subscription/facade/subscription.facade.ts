import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AbstractSubscriptionRepository } from '../domain-services/interfaces/subscription.interface';
import { Subscription } from '../domain/subscription.interface';

@Injectable()
export class SubscriptionFacade {
  constructor(
    @Inject(AbstractSubscriptionRepository)
    private readonly subscriptionRepository: AbstractSubscriptionRepository,
  ) {}

  async getConfirmedSubscriptionsByFrequency(frequency: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findManyConfirmedByFrequency(frequency);
  }
}
