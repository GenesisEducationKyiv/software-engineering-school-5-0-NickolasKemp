import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { WeatherService } from '../weather/weather.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionManager } from '../interfaces/subscription.interface';
import { SubscriptionRepository } from './prisma-subscription.repository';

@Injectable()
export class SubscriptionService implements SubscriptionManager {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly weatherService: WeatherService,
  ) {}

  async subscribe(createSubscriptionDto: CreateSubscriptionDto): Promise<void> {
    const { email, city, frequency } = createSubscriptionDto;

    const existing = await this.subscriptionRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    try {
      await this.weatherService.getWeather(city);
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
        await this.emailService.sendConfirmationEmail(email, { token: confirmationToken, appUrl });
        this.logger.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send confirmation email to ${email}`, emailError.stack);

        await this.subscriptionRepository.delete(subscription.id);
        throw emailError;
      }

      this.logger.log(
        `Subscription created for ${email} with city ${city} and frequency ${frequency}`,
      );
    } catch (error) {
      this.logger.error(`Failed to create subscription for ${email}`, error.stack);
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
    } catch (error) {
      this.logger.error(`Failed to confirm subscription with token ${token}`, error.stack);
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
    } catch (error) {
      this.logger.error(`Failed to delete subscription with token ${token}`, error.stack);
      throw error;
    }
  }
}
