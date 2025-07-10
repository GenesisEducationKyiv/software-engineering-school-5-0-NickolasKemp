import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from './prisma-subscription.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractWeatherService } from '../interfaces/weather.interface';

jest.mock('uuid', () => ({
  v4: jest
    .fn()
    .mockReturnValueOnce('confirmation-token-1')
    .mockReturnValueOnce('unsubscribe-token-1')
    .mockReturnValueOnce('confirmation-token-2')
    .mockReturnValueOnce('unsubscribe-token-2'),
}));

class MockSubscriptionRepository extends SubscriptionRepository {
  constructor() {
    super({} as PrismaService);
  }

  findByEmail = jest.fn();
  findByConfirmationToken = jest.fn();
  findByUnsubscribeToken = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockWeatherService: jest.Mocked<AbstractWeatherService>;

  const mockSubscriptionRepository = new MockSubscriptionRepository();

  const mockEmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const createMockSubscription = (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    city: 'London',
    frequency: 'daily',
    confirmed: false,
    confirmationToken: 'test-token',
    unsubscribeToken: 'test-unsubscribe-token',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    mockWeatherService = {
      getWeather: jest.fn(),
    } as unknown as jest.Mocked<AbstractWeatherService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: mockSubscriptionRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AbstractWeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a new subscription and send confirmation email', async () => {
      const email = 'test@example.com';
      const city = 'London';
      const frequency = 'daily';

      mockSubscriptionRepository.findByEmail.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(
        createMockSubscription({ email, city, frequency }),
      );

      await service.subscribe({ email, city, frequency });

      expect(mockSubscriptionRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockWeatherService.getWeather).toHaveBeenCalledWith(city);
      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already subscribed', async () => {
      const email = 'test@example.com';

      mockSubscriptionRepository.findByEmail.mockResolvedValue(createMockSubscription({ email }));

      await expect(
        service.subscribe({ email, city: 'London', frequency: 'daily' }),
      ).rejects.toThrow(ConflictException);
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if city not found', async () => {
      const email = 'test@example.com';
      const city = 'NonExistentCity';

      mockSubscriptionRepository.findByEmail.mockResolvedValue(null);
      mockWeatherService.getWeather.mockRejectedValue(new Error('City not found'));

      await expect(service.subscribe({ email, city, frequency: 'daily' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription', async () => {
      const token = 'test-token';
      const subscription = createMockSubscription({ confirmationToken: token });

      mockSubscriptionRepository.findByConfirmationToken.mockResolvedValue(subscription);

      await service.confirm(token);

      expect(mockSubscriptionRepository.findByConfirmationToken).toHaveBeenCalledWith(token);
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(subscription.id, {
        confirmed: true,
        confirmationToken: null,
      });
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockSubscriptionRepository.findByConfirmationToken.mockResolvedValue(null);

      await expect(service.confirm('invalid-token')).rejects.toThrow(NotFoundException);
      expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should delete a subscription', async () => {
      const token = 'test-token';
      const subscription = createMockSubscription({ unsubscribeToken: token });

      mockSubscriptionRepository.findByUnsubscribeToken.mockResolvedValue(subscription);

      await service.unsubscribe(token);

      expect(mockSubscriptionRepository.findByUnsubscribeToken).toHaveBeenCalledWith(token);
      expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(subscription.id);
    });

    it('should throw NotFoundException if token is not found', async () => {
      mockSubscriptionRepository.findByUnsubscribeToken.mockResolvedValue(null);

      await expect(service.unsubscribe('invalid-token')).rejects.toThrow(NotFoundException);
      expect(mockSubscriptionRepository.delete).not.toHaveBeenCalled();
    });
  });
});
