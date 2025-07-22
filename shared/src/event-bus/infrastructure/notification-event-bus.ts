import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BullEventBus } from '@shared/event-bus/infrastructure/bull.event-bus';
import { NOTIFICATION_EVENT_GROUP } from '@shared/event-bus/domain-services/notification/notification.event';

@Injectable()
export class NotificationEventBus extends BullEventBus {
  constructor(@InjectQueue(NOTIFICATION_EVENT_GROUP) queue: Queue) {
    super(queue, NOTIFICATION_EVENT_GROUP);
  }
}
