import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubscriptionRepository,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from '../interfaces/subscription.interface';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
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
}
