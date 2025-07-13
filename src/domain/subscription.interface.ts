import { Subscription } from '@prisma/client';
import { CreateSubscriptionDto } from '../subscription/app-services/dto/create-subscription.dto';

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
  abstract findManyConfirmedByFrequency(frequency: string): Promise<any[]>;
}

export interface SubscriptionManager {
  subscribe(data: CreateSubscriptionDto): Promise<void>;
  unsubscribe(token: string): Promise<void>;
  confirm(token: string): Promise<void>;
}
