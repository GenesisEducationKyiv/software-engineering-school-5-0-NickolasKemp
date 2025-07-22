import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationEventBus } from './notification-event-bus';
import { EventBus } from '../domain-services/event-bus.interface';
import { NOTIFICATION_EVENT_GROUP } from '../domain-services/notification/notification.event';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_EVENT_GROUP,
    }),
  ],
  providers: [
    NotificationEventBus,
    {
      provide: EventBus,
      useExisting: NotificationEventBus,
    },
  ],
  exports: [NotificationEventBus, EventBus],
})
export class EventBusModule {}
