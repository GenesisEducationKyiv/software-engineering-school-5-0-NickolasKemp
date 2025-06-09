import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { WeatherData } from '../weather/weather.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } catch (error) {
      this.logger.error('Failed to create email transporter', error.stack);
      throw error;
    }
  }

  async sendConfirmationEmail(email: string, token: string, appUrl: string): Promise<void> {
    try {
      const confirmUrl = `${appUrl}/api/confirm/${token}`;

      await this.transporter.sendMail({
        to: email,
        subject: 'Confirm Your Weather Subscription',
        text: `Please click the following link to confirm your weather subscription: ${confirmUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Weather Subscription Confirmation</h2>
            <p>Thank you for subscribing to our weather updates service!</p>
            <p>Please click the button below to confirm your subscription:</p>
            <a href="${confirmUrl}" style="display: inline-block; background-color:rgb(37, 99, 235); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Confirm Subscription
            </a>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p>${confirmUrl}</p>
          </div>
        `,
      });

      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      console.error(error);
      this.logger.error(`Failed to send confirmation email to ${email}`, error.stack);
      throw error;
    }
  }

  async sendWeatherUpdate(
    email: string,
    city: string,
    weather: WeatherData,
    unsubscribeToken: string,
    appUrl: string,
  ): Promise<void> {
    try {
      const unsubscribeUrl = `${appUrl}/api/unsubscribe/${unsubscribeToken}`;

      await this.transporter.sendMail({
        to: email,
        subject: `Weather Update for ${city}`,
        text: `
        Current Weather for ${city}:
        Temperature: ${weather.temperature}°C
        Humidity: ${weather.humidity}%
        Conditions: ${weather.description}
        
        To unsubscribe from these updates, click here: ${unsubscribeUrl}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Weather Update for ${city}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Temperature:</strong> ${weather.temperature}°C</p>
              <p><strong>Humidity:</strong> ${weather.humidity}%</p>
              <p><strong>Conditions:</strong> ${weather.description}</p>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              To unsubscribe from these updates, 
              <a href="${unsubscribeUrl}">click here</a>
            </p>
          </div>
        `,
      });

      this.logger.log(`Weather update sent to ${email} for ${city}`);
    } catch (error) {
      this.logger.error(`Failed to send weather update to ${email} for ${city}`, error.stack);
      throw error;
    }
  }
}
