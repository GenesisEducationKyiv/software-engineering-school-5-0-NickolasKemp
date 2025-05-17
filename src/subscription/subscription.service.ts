import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly isDev: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.isDev = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  async subscribe(email: string, city: string, frequency: 'hourly' | 'daily'): Promise<void> {
    const existing = await this.prisma.subscription.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      throw new ConflictException('Email already subscribed');
    }
    
    const confirmationToken = uuidv4();
    const unsubscribeToken = uuidv4();
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    
    try {
      // Create the subscription first
      const subscription = await this.prisma.subscription.create({
        data: {
          email,
          city,
          frequency,
          confirmationToken,
          unsubscribeToken,
        },
      });
      
      // Try to send the email
      try {
        await this.emailService.sendConfirmationEmail(email, confirmationToken, appUrl);
        this.logger.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send confirmation email to ${email}`, emailError.stack);
        
        // In development, we can continue without email delivery
        // In production, this is a critical error - we should delete the subscription
        if (!this.isDev) {
          // Rollback the subscription if email fails in production
          await this.prisma.subscription.delete({
            where: { id: subscription.id },
          });
          throw emailError;
        } else {
          // In development, log the confirmation URL for manual testing
          this.logger.warn(`DEV MODE: Confirmation URL would be: ${appUrl}/api/confirm/${confirmationToken}`);
          this.logger.warn(`DEV MODE: Unsubscribe URL would be: ${appUrl}/api/unsubscribe/${unsubscribeToken}`);
        }
      }
      
      this.logger.log(`Subscription created for ${email} with city ${city} and frequency ${frequency}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations
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
