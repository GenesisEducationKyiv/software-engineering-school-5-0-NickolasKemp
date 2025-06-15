import { CreateSubscriptionDto } from '../subscription/dto/create-subscription.dto';

export interface SubscriptionManager {
  subscribe(data: CreateSubscriptionDto): Promise<void>;
  unsubscribe(token: string): Promise<void>;
  confirm(token: string): Promise<void>;
}
