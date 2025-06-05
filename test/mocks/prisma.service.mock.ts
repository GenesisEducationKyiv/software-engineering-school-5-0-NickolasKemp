import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MockPrismaService implements OnModuleInit, OnModuleDestroy {
  // In-memory storage for subscriptions
  private subscriptions: Map<string, any> = new Map();
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
        }) => {
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

      findFirst: jest.fn(({ where }) => {
        const { confirmationToken, unsubscribeToken } = where || {};

        if (confirmationToken) {
          return this.findByConfirmationToken(confirmationToken);
        } else if (unsubscribeToken) {
          return this.findByUnsubscribeToken(unsubscribeToken);
        }

        return null;
      }),

      create: jest.fn(
        ({
          data,
        }: {
          data: {
            email: string;
            confirmationToken?: string;
            unsubscribeToken?: string;
            frequency?: string;
          };
        }) => {
          const id = this.lastId++;
          const subscription: {
            id: number;
            email: string;
            confirmationToken?: string;
            unsubscribeToken?: string;
            frequency?: string;
            confirmed: boolean;
            createdAt: Date;
            updatedAt: Date;
          } = {
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
        const { id, confirmationToken, unsubscribeToken } = where || {};

        let subscription;

        if (id) {
          subscription = this.findById(id);
        } else if (confirmationToken) {
          subscription = this.findByConfirmationToken(confirmationToken);
        } else if (typeof unsubscribeToken === 'string') {
          subscription = this.findByUnsubscribeToken(unsubscribeToken);
        }

        if (subscription) {
          const updated = { ...subscription, ...data, updatedAt: new Date() };
          this.subscriptions.set(updated.email, updated);
          return updated;
        }

        return null;
      }),

      delete: jest.fn(({ where }) => {
        const { id, unsubscribeToken } = where || {};

        let subscription;

        if (id) {
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

      findMany: jest.fn(({ where }) => {
        const { confirmed, frequency } = where || {};

        return Array.from(this.subscriptions.values()).filter((sub) => {
          if (confirmed !== undefined && sub.confirmed !== confirmed) return false;
          if (frequency !== undefined && sub.frequency !== frequency) return false;
          return true;
        });
      }),
    };
  }

  private findByEmail(email: string) {
    return this.subscriptions.get(email) || null;
  }

  private findById(id: number) {
    return Array.from(this.subscriptions.values()).find((sub) => sub.id === id) || null;
  }

  private findByConfirmationToken(token: string) {
    return (
      Array.from(this.subscriptions.values()).find((sub) => sub.confirmationToken === token) || null
    );
  }

  private findByUnsubscribeToken(token: string) {
    return (
      Array.from(this.subscriptions.values()).find((sub) => sub.unsubscribeToken === token) || null
    );
  }
}
