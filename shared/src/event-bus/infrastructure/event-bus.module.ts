import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventBusSubscriptionTopic } from './subscription-topic';
import { EventBus } from '../domain-services/event-bus.interface';
import { SUBSCRIPTION_EVENT_GROUP } from '../domain-services/subscription/subscription.event';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SUBSCRIPTION_EVENT_GROUP,
    }),
  ],
  providers: [
    EventBusSubscriptionTopic,
    {
      provide: EventBus,
      useExisting: EventBusSubscriptionTopic,
    },
  ],
  exports: [EventBusSubscriptionTopic, EventBus],
})
export class EventBusModule {}
