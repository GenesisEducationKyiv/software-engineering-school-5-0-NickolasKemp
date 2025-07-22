import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CreateSubscriptionDto } from '../application-services/dto/create-subscription.dto';
import { AbstractSubscriptionService } from './interfaces/subscription.interface';
import { SubscriptionRepository } from '../infrastructure/prisma-subscription.repository';
import { Logger } from '@shared/infrastructure/logger';
import { WeatherFacade } from '@weather/public/weather.facade';
import { NotificationService } from './notification.service';

@Injectable()
export class SubscriptionService implements AbstractSubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly weatherFacade: WeatherFacade,
  ) {}

  async subscribe(createSubscriptionDto: CreateSubscriptionDto): Promise<void> {
    const { email, city, frequency } = createSubscriptionDto;

    const existing = await this.subscriptionRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    try {
      await this.weatherFacade.getWeather({ city });
    } catch {
      throw new NotFoundException('City not found');
    }

    const confirmationToken = uuidv4();
    const unsubscribeToken = uuidv4();
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    try {
      const subscription = await this.subscriptionRepository.create({
        email,
        city,
        frequency,
        confirmationToken,
        unsubscribeToken,
      });

      try {
        await this.notificationService.sendSubscriptionConfirmation(email, {
          token: confirmationToken,
          appUrl,
        });
      } catch (emailError: unknown) {
        this.logger.error(`Failed to send confirmation email to ${email}`, emailError);

        await this.subscriptionRepository.delete(subscription.id);
        throw emailError;
      }

      this.logger.log(
        `Subscription created for ${email} with city ${city} and frequency ${frequency}`,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to create subscription for ${email}`, error);
      throw error;
    }
  }

  async confirm(token: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findByConfirmationToken(token);

    if (!subscription) {
      throw new NotFoundException('Confirmation token not found');
    }

    try {
      await this.subscriptionRepository.update(subscription.id, {
        confirmed: true,
        confirmationToken: null,
      });

      this.logger.log(`Subscription confirmed for ${subscription.email}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to confirm subscription with token ${token}`, error);
      throw error;
    }
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findByUnsubscribeToken(token);

    if (!subscription) {
      throw new NotFoundException('Unsubscribe token not found');
    }

    try {
      await this.subscriptionRepository.delete(subscription.id);

      this.logger.log(`Subscription deleted for ${subscription.email}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete subscription with token ${token}`, error);
      throw error;
    }
  }
}
