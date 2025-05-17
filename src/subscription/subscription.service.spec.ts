import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as uuid from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('confirmation-token-1')
    .mockReturnValueOnce('unsubscribe-token-1')
    .mockReturnValueOnce('confirmation-token-2')
    .mockReturnValueOnce('unsubscribe-token-2'),
}));

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let configService: ConfigService;

  const mockPrismaService = {
    subscription: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a new subscription and send confirmation email', async () => {
      const email = 'test@example.com';
      const city = 'London';
      const frequency = 'daily';
      
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.create.mockResolvedValue({
        id: 1,
        email,
        city,
        frequency,
        confirmationToken: 'test-token',
        unsubscribeToken: 'test-unsubscribe-token',
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await service.subscribe(email, city, frequency);
      
      expect(mockPrismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockPrismaService.subscription.create).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already subscribed', async () => {
      const email = 'test@example.com';
      
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 1,
        email,
      });
      
      await expect(service.subscribe(email, 'London', 'daily')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.subscription.create).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription', async () => {
      const token = 'test-token';
      const subscription = {
        id: 1,
        email: 'test@example.com',
        confirmationToken: token,
      };
      
      mockPrismaService.subscription.findFirst.mockResolvedValue(subscription);
      
      await service.confirm(token);
      
      expect(mockPrismaService.subscription.findFirst).toHaveBeenCalledWith({
        where: { confirmationToken: token },
      });
      expect(mockPrismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: subscription.id },
        data: { confirmed: true, confirmationToken: null },
      });
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      
      await expect(service.confirm('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should delete a subscription', async () => {
      const token = 'test-token';
      const subscription = {
        id: 1,
        email: 'test@example.com',
        unsubscribeToken: token,
      };
      
      mockPrismaService.subscription.findFirst.mockResolvedValue(subscription);
      
      await service.unsubscribe(token);
      
      expect(mockPrismaService.subscription.findFirst).toHaveBeenCalledWith({
        where: { unsubscribeToken: token },
      });
      expect(mockPrismaService.subscription.delete).toHaveBeenCalledWith({
        where: { id: subscription.id },
      });
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      
      await expect(service.unsubscribe('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.subscription.delete).not.toHaveBeenCalled();
    });
  });
});
