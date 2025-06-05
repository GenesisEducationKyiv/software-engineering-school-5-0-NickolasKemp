import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WeatherService } from '../weather/weather.service';
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly weatherService: WeatherService,
  ) {}

  async subscribe(email: string, city: string, frequency: 'hourly' | 'daily'): Promise<void> {
    const existing = await this.prisma.subscription.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    try {
      await this.weatherService.getWeather(city);
    } catch (error) {
      throw new NotFoundException('City not found');
    }
    
    const confirmationToken = uuidv4();
    const unsubscribeToken = uuidv4();
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    
    try {
      const subscription = await this.prisma.subscription.create({
        data: {
          email,
          city,
          frequency,
          confirmationToken,
          unsubscribeToken,
        },
      });
      
      try {
        await this.emailService.sendConfirmationEmail(email, confirmationToken, appUrl);
        this.logger.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send confirmation email to ${email}`, emailError.stack);
        
          await this.prisma.subscription.delete({
            where: { id: subscription.id },
          });
          throw emailError;

      }
      
      this.logger.log(`Subscription created for ${email} with city ${city} and frequency ${frequency}`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already subscribed');
        }
      }
      this.logger.error(`Failed to create subscription for ${email}`, error.stack);
      throw error;
    }
  }

  async confirm(token: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({ 
      where: { confirmationToken: token } 
    });
    
    if (!subscription) {
      throw new NotFoundException('Confirmation token not found');
    }
    
    try {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { confirmed: true, confirmationToken: null },
      });
      
      this.logger.log(`Subscription confirmed for ${subscription.email}`);
    } catch (error) {
      this.logger.error(`Failed to confirm subscription with token ${token}`, error.stack);
      throw error;
    }
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({ 
      where: { unsubscribeToken: token } 
    });
    
    if (!subscription) {
      throw new NotFoundException('Unsubscribe token not found');
    }
    
    try {
      await this.prisma.subscription.delete({
        where: { id: subscription.id },
      });
      
      this.logger.log(`Subscription deleted for ${subscription.email}`);
    } catch (error) {
      this.logger.error(`Failed to delete subscription with token ${token}`, error.stack);
      throw error;
    }
  }
}
