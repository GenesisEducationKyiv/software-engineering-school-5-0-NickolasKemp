export interface Subscription {
  id: number;
  email: string;
  city: string;
  frequency: string;
  confirmed: boolean;
  confirmationToken: string | null;
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}
