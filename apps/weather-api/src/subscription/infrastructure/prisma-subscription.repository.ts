import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from '../../domain/subscription.interface';
import { AbstractSubscriptionRepository } from '../../domain/subscription.interface';

@Injectable()
export class SubscriptionRepository implements AbstractSubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.subscription.findUnique({
      where: { email },
    });
  }

  async findByConfirmationToken(token: string) {
    return this.prisma.subscription.findFirst({
      where: { confirmationToken: token },
    });
  }

  async findByUnsubscribeToken(token: string) {
    return this.prisma.subscription.findFirst({
      where: { unsubscribeToken: token },
    });
  }

  async create(data: CreateSubscriptionData) {
    return this.prisma.subscription.create({
      data,
    });
  }

  async update(id: number, data: UpdateSubscriptionData) {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }

  async findManyConfirmedByFrequency(frequency: string) {
    return this.prisma.subscription.findMany({
      where: { confirmed: true, frequency },
    });
  }
}
