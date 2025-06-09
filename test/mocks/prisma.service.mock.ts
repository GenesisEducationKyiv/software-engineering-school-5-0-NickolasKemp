import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subscription } from '@prisma/client';

@Injectable()
export class MockPrismaService implements OnModuleInit, OnModuleDestroy {
  // In-memory storage for subscriptions
  private subscriptions: Map<string, Subscription> = new Map();
  private lastId = 1;

  async onModuleInit() {}

  async onModuleDestroy() {}

  get subscription() {
    return {
      findUnique: jest.fn(
        ({
          where,
        }: {
          where?: { email?: string; confirmationToken?: string; unsubscribeToken?: string };
        }): Subscription | null => {
          const { email, confirmationToken, unsubscribeToken } = where || {};
          if (email) {
            return this.findByEmail(email);
          } else if (confirmationToken) {
            return this.findByConfirmationToken(confirmationToken);
          } else if (unsubscribeToken) {
            return this.findByUnsubscribeToken(unsubscribeToken);
          }
          return null;
        },
      ),

      findFirst: jest.fn(
        ({
          where,
        }: {
          where?: { confirmationToken?: string; unsubscribeToken?: string };
        }): Subscription | null => {
          const { confirmationToken, unsubscribeToken } = where || {};
          if (confirmationToken) {
            return this.findByConfirmationToken(confirmationToken);
          } else if (unsubscribeToken) {
            return this.findByUnsubscribeToken(unsubscribeToken);
          }
          return null;
        },
      ),

      create: jest.fn(
        ({ data }: { data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> }) => {
          const id = this.lastId++;
          const subscription: Subscription = {
            id,
            ...data,
            confirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          this.subscriptions.set(data.email, subscription);
          return subscription;
        },
      ),

      update: jest.fn(({ where, data }) => {
        const { id, confirmationToken, unsubscribeToken } = (where || {}) as {
          id?: number;
          confirmationToken?: string;
          unsubscribeToken?: string;
        };

        let subscription: Subscription | null = null;

        if (id !== undefined) {
          subscription = this.findById(id);
        } else if (confirmationToken) {
          subscription = this.findByConfirmationToken(confirmationToken);
        } else if (typeof unsubscribeToken === 'string') {
          subscription = this.findByUnsubscribeToken(unsubscribeToken);
        }

        if (subscription) {
          const updated: Subscription = { ...subscription, ...data, updatedAt: new Date() };
          this.subscriptions.set(updated.email, updated);
          return updated;
        }

        return null;
      }),

      delete: jest.fn(({ where }: { where?: { id?: number; unsubscribeToken?: string } }) => {
        const { id, unsubscribeToken } = (where || {}) as {
          id?: number;
          unsubscribeToken?: string;
        };
        let subscription: Subscription | null = null;
        if (id !== undefined) {
          subscription = this.findById(id);
        } else if (unsubscribeToken) {
          subscription = this.findByUnsubscribeToken(unsubscribeToken);
        }
        if (subscription) {
          this.subscriptions.delete(subscription.email);
          return subscription;
        }
        return null;
      }),

      deleteMany: jest.fn(() => {
        const count = this.subscriptions.size;
        this.subscriptions.clear();
        return { count };
      }),

      findMany: jest.fn(({ where }: { where?: { confirmed?: boolean; frequency?: string } }) => {
        const { confirmed, frequency } = (where || {}) as {
          confirmed?: boolean;
          frequency?: string;
        };
        return Array.from(this.subscriptions.values()).filter((sub: Subscription) => {
          if (confirmed !== undefined && sub.confirmed !== confirmed) return false;
          if (frequency !== undefined && sub.frequency !== frequency) return false;
          return true;
        });
      }),
    };
  }

  private findByEmail(email: string): Subscription | null {
    return (this.subscriptions.get(email) as Subscription) || null;
  }

  private findById(id: number): Subscription | null {
    return (
      Array.from(this.subscriptions.values()).find((sub: Subscription) => sub.id === id) || null
    );
  }

  private findByConfirmationToken(token: string): Subscription | null {
    return (
      Array.from(this.subscriptions.values()).find(
        (sub: Subscription) => sub.confirmationToken === token,
      ) || null
    );
  }

  private findByUnsubscribeToken(token: string): Subscription | null {
    return (
      Array.from(this.subscriptions.values()).find(
        (sub: Subscription) => sub.unsubscribeToken === token,
      ) || null
    );
  }
}
