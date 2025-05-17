import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../src/subscription/subscription.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmailService } from '../src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('confirmation-token-1')
    .mockReturnValueOnce('unsubscribe-token-1')
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
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.create.mockResolvedValue({
        id: 'sub-id-1',
        email: 'test@example.com',
        city: 'London',
        frequency: 'daily',
        confirmationToken: 'confirmation-token-1',
        unsubscribeToken: 'unsubscribe-token-1',
      });

      await service.subscribe('test@example.com', 'London', 'daily');

      expect(mockPrismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.subscription.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
          confirmationToken: 'confirmation-token-1',
          unsubscribeToken: 'unsubscribe-token-1',
        },
      });
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'confirmation-token-1',
        'http://localhost:3000',
      );
    });

    it('should throw ConflictException if email is already subscribed', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      await expect(
        service.subscribe('test@example.com', 'London', 'daily')
      ).rejects.toThrow(ConflictException);
      
      expect(mockPrismaService.subscription.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-id-1',
        email: 'test@example.com',
        confirmationToken: 'valid-token',
      });

      await service.confirm('valid-token');

      expect(mockPrismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { confirmationToken: 'valid-token' },
      });
      expect(mockPrismaService.subscription.update).toHaveBeenCalledWith({
        where: { confirmationToken: 'valid-token' },
        data: { confirmed: true, confirmationToken: null },
      });
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.confirm('invalid-token')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should delete a subscription', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-id-1',
        email: 'test@example.com',
        unsubscribeToken: 'valid-token',
      });

      await service.unsubscribe('valid-token');

      expect(mockPrismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { unsubscribeToken: 'valid-token' },
      });
      expect(mockPrismaService.subscription.delete).toHaveBeenCalledWith({
        where: { unsubscribeToken: 'valid-token' },
      });
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.unsubscribe('invalid-token')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.subscription.delete).not.toHaveBeenCalled();
    });
  });
}); 