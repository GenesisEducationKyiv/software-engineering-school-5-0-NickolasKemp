import { Job, Queue } from 'bull';
import { Event, EventBus } from '../domain-services/event-bus.interface';
import { Logger } from '@shared/infrastructure/logger';

export class BullEventBus implements EventBus {
  protected readonly logger: Logger;
  constructor(
    protected readonly queue: Queue,
    protected readonly queueName: string,
  ) {
    this.logger = new Logger(`${this.constructor.name}(${queueName})`);
  }

  async publish(event: Event): Promise<void> {
    this.logger.log(`Publishing event: ${event.name} for queue: ${this.queueName}`);
    await this.queue.add(event.name, event.payload);
  }

  subscribe(eventName: string, handler: (payload: unknown) => Promise<void>): void {
    this.logger.log(`Subscribing to event: ${eventName} for queue: ${this.queueName}`);
    void this.queue.process(eventName, async (job: Job<unknown>) => {
      const payload = job.data;
      await handler(payload);
    });
    this.logger.log(`Subscribed to event: ${eventName} for queue: ${this.queueName}`);
  }
}
