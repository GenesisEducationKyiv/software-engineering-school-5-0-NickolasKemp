import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';
import { WeatherData } from '../weather/weather.service';

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  const mockSendMail = jest.fn().mockImplementation(() => Promise.resolve());
  const mockCreateTransport = jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  }));

  beforeEach(async () => {
    jest.clearAllMocks();

    (nodemailer.createTransport as jest.Mock) = mockCreateTransport;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string | number> = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: 587,
                SMTP_USER: 'test-user',
                SMTP_PASS: 'test-pass',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  it('should create a transporter with correct config', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test-user',
        pass: 'test-pass',
      },
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should send a confirmation email with correct parameters', async () => {
      const email: string = 'test@example.com';
      const token: string = 'test-token';
      const appUrl: string = 'http://localhost:3000';

      await emailService.sendConfirmationEmail(email, token, appUrl);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Confirm Your Weather Subscription',
          text: expect.stringContaining(token) as string,
          html: expect.stringContaining(token) as string,
        }),
      );
    });

    it('should propagate errors from the mail transport', async () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const appUrl = 'http://localhost:3000';

      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(emailService.sendConfirmationEmail(email, token, appUrl)).rejects.toThrow(
        'SMTP error',
      );
    });
  });

  describe('sendWeatherUpdate', () => {
    it('should send a weather update email with correct parameters', async () => {
      const email = 'test@example.com';
      const city = 'London';
      const weather: WeatherData = {
        temperature: 20,
        humidity: 65,
        description: 'Partly cloudy',
      };
      const token = 'unsub-token';
      const appUrl = 'http://localhost:3000';

      await emailService.sendWeatherUpdate(email, city, weather, token, appUrl);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: `Weather Update for ${city}`,
          text: expect.stringContaining('Temperature: 20°C') as string,
          html: expect.stringContaining('Temperature:</strong> 20°C') as string,
        }),
      );
    });
  });
});
