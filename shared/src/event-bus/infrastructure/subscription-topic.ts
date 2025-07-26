import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BullEventBus } from '@shared/event-bus/infrastructure/bull.event-bus';
import { SUBSCRIPTION_EVENT_GROUP } from '@shared/event-bus/domain-services/subscription/subscription.event';

@Injectable()
export class EventBusSubscriptionTopic extends BullEventBus {
  constructor(@InjectQueue(SUBSCRIPTION_EVENT_GROUP) queue: Queue) {
    super(queue, SUBSCRIPTION_EVENT_GROUP);
  }
}
