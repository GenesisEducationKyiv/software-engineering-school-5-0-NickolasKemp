export interface Event {
  name: string;
  payload: any;
}

export abstract class EventBus {
  abstract publish(event: Event): Promise<void>;
  abstract subscribe(event: Event, callback: (event: Event) => void): Promise<void>;
}
