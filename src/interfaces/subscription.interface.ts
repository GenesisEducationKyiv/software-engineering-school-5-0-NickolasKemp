import { Subscription } from '@prisma/client';
import { CreateSubscriptionDto } from '../subscription/dto/create-subscription.dto';

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

export interface SubscriptionRepository {
  findByEmail(email: string): Promise<Subscription | null>;
  findByConfirmationToken(token: string): Promise<Subscription | null>;
  findByUnsubscribeToken(token: string): Promise<Subscription | null>;
  create(data: CreateSubscriptionData): Promise<Subscription>;
  update(id: number, data: UpdateSubscriptionData): Promise<Subscription>;
  delete(id: number): Promise<void>;
}

export interface SubscriptionManager {
  subscribe(data: CreateSubscriptionDto): Promise<void>;
  unsubscribe(token: string): Promise<void>;
  confirm(token: string): Promise<void>;
}
