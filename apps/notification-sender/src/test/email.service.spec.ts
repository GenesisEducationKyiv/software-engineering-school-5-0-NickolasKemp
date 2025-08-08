import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailSender } from '../infrastructure/email/email-sender';
import { AbstractEmailMetrics } from '../metrics/domain-services/email-metrics.interface';

jest.mock('nodemailer');

describe('EmailSender', () => {
  let emailService: EmailSender;
  const mockSendMail = jest.fn().mockImplementation(() => Promise.resolve());
  const mockCreateTransport = jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  }));

  beforeEach(async () => {
    jest.clearAllMocks();

    (nodemailer.createTransport as jest.Mock) = mockCreateTransport;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSender,
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
        {
          provide: AbstractEmailMetrics,
          useValue: {
            recordEmailSent: jest.fn(),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailSender>(EmailSender);
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

  describe('sendEmail', () => {
    it('should send an email with correct parameters', async () => {
      const email: string = 'test@example.com';
      const template = {
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>',
      };

      await emailService.sendEmail(email, template);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Test Subject',
          text: 'Test text content',
          html: '<p>Test HTML content</p>',
        }),
      );
    });

    it('should propagate errors from the mail transport', async () => {
      const email = 'test@example.com';
      const template = {
        subject: 'Test Subject',
        text: 'Test text content',
        html: '<p>Test HTML content</p>',
      };

      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(emailService.sendEmail(email, template)).rejects.toThrow('SMTP error');
    });
  });
});
