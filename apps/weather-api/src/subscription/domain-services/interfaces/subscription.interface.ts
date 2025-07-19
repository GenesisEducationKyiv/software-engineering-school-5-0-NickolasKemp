import { CreateSubscriptionDto } from '@subscription/application-services/dto/create-subscription.dto';
import { Subscription } from '../../domain/subscription.interface';

export interface CreateSubscriptionData {
  email: string;
  city: string;
  frequency: string;
  confirmationToken: string;
  unsubscribeToken: string;
}
export interface UpdateSubscriptionData {
  confirmed?: boolean;
  confirmationToken?: string | null;
}

export abstract class AbstractSubscriptionRepository {
  abstract findByEmail(email: string): Promise<Subscription | null>;
  abstract findByConfirmationToken(token: string): Promise<Subscription | null>;
  abstract findByUnsubscribeToken(token: string): Promise<Subscription | null>;
  abstract create(data: CreateSubscriptionData): Promise<Subscription>;
  abstract update(id: number, data: UpdateSubscriptionData): Promise<Subscription>;
  abstract delete(id: number): Promise<void>;
  abstract findManyConfirmedByFrequency(frequency: string): Promise<Subscription[]>;
}

export abstract class AbstractSubscriptionService {
  abstract subscribe(data: CreateSubscriptionDto): Promise<void>;
  abstract unsubscribe(token: string): Promise<void>;
  abstract confirm(token: string): Promise<void>;
}
