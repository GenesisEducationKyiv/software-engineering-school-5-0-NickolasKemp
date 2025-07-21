import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Event, EventBus } from '../domain-services/event-bus.interface';
import { Logger } from '@shared/infrastructure/logger';

@Injectable()
export class BullEventBus implements EventBus {
  private readonly logger = new Logger(BullEventBus.name);

  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  async publish(event: Event): Promise<void> {
    this.logger.log(`Publishing event: ${event.name}`);
    await this.eventsQueue.add(event.name, event.payload);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async subscribe(_event: Event, _callback: (event: Event) => void): Promise<void> {
    // This method is not used in Bull implementation as we use processors instead
    // The subscription is handled by Bull processors
    this.logger.log(`Subscribing to event: ${_event.name}`);
  }
}
