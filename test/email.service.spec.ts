import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../src/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'mock-message-id',
        envelope: {},
      }),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const mockConfigService = {
      get: jest.fn((key) => {
        switch(key) {
          case 'SMTP_HOST': return 'smtp.example.com';
          case 'SMTP_PORT': return 587;
          case 'SMTP_USER': return 'test-user';
          case 'SMTP_PASS': return 'test-password';
          default: return null;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create transporter with correct config', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'test-user',
        pass: 'test-password',
      },
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email with correct parameters', async () => {
      const email = 'subscriber@example.com';
      const token = 'test-confirmation-token';
      const appUrl = 'http://localhost:3000';

      await service.sendConfirmationEmail(email, token, appUrl);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Confirm Your Weather Subscription',
        text: `Click to confirm: ${appUrl}/api/confirm/${token}`,
      });
    });

    it('should propagate errors from the mail transport', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        service.sendConfirmationEmail('test@example.com', 'token', 'http://localhost:3000')
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('sendWeatherUpdate', () => {
    it('should send weather update with correct parameters', async () => {
      const email = 'subscriber@example.com';
      const city = 'London';
      const weather = {
        temperature: 22,
        humidity: 75,
        description: 'Partly cloudy',
      };
      const token = 'test-unsubscribe-token';
      const appUrl = 'http://localhost:3000';

      await service.sendWeatherUpdate(email, city, weather, token, appUrl);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: `Weather Update for ${city}`,
        text: `Temperature: ${weather.temperature}°C\nHumidity: ${weather.humidity}%\nDescription: ${weather.description}\nUnsubscribe: ${appUrl}/api/unsubscribe/${token}`,
      });
    });
  });
}); 