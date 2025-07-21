import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullEventBus } from './infrastructure/bull.event-bus';
import { EventBus } from './domain-services/event-bus.interface';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  providers: [
    {
      provide: EventBus,
      useClass: BullEventBus,
    },
  ],
  exports: [EventBus],
})
export class EventBusModule {}
