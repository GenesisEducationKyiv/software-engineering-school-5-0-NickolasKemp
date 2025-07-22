export interface Event {
  name: string;
  payload: unknown;
}

export abstract class EventBus {
  abstract publish(event: Event): Promise<void>;
  abstract subscribe(eventName: string, handler: (payload: unknown) => Promise<void>): void;
}
