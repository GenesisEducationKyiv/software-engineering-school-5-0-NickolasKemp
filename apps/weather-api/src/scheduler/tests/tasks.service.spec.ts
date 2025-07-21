import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../application-services/scheduler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WeatherService } from '../../weather/domain-services/weather.service';
import { EmailService } from '../../../../../shared/src/infrastructure/email-sender/email.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { AbstractSubscriptionRepository } from '../../domain/subscription.interface';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrismaService = {
    subscription: {
      findMany: jest.fn(),
    },
  };

  const mockWeatherService = {};
  const mockEmailService = {};
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  const mockSubscriptionRepository = {
    findManyConfirmedByFrequency: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: AbstractSubscriptionRepository,
          useValue: mockSubscriptionRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WeatherService,
          useValue: mockWeatherService,
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
          provide: getQueueToken('weather-updates'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduleHourlyUpdates', () => {
    it('should queue hourly weather updates for confirmed subscribers', async () => {
      const confirmedSubscriptions = [
        {
          id: 'sub-1',
          email: 'user1@example.com',
          city: 'London',
          unsubscribeToken: 'token-1',
          frequency: 'hourly',
          confirmed: true,
        },
        {
          id: 'sub-2',
          email: 'user2@example.com',
          city: 'Paris',
          unsubscribeToken: 'token-2',
          frequency: 'hourly',
          confirmed: true,
        },
      ];

      mockSubscriptionRepository.findManyConfirmedByFrequency.mockResolvedValue(
        confirmedSubscriptions,
      );

      await service.scheduleHourlyUpdates();

      expect(mockSubscriptionRepository.findManyConfirmedByFrequency).toHaveBeenCalledWith(
        'hourly',
      );

      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenNthCalledWith(1, {
        email: 'user1@example.com',
        city: 'London',
        token: 'token-1',
        appUrl: 'http://localhost:3000',
      });
      expect(mockQueue.add).toHaveBeenNthCalledWith(2, {
        email: 'user2@example.com',
        city: 'Paris',
        token: 'token-2',
        appUrl: 'http://localhost:3000',
      });
    });

    it('should not queue anything if no confirmed hourly subscribers exist', async () => {
      mockSubscriptionRepository.findManyConfirmedByFrequency.mockResolvedValue([]);

      await service.scheduleHourlyUpdates();

      expect(mockSubscriptionRepository.findManyConfirmedByFrequency).toHaveBeenCalledWith(
        'hourly',
      );
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('scheduleDailyUpdates', () => {
    it('should queue daily weather updates for confirmed subscribers', async () => {
      const confirmedSubscriptions = [
        {
          id: 'sub-3',
          email: 'user3@example.com',
          city: 'Berlin',
          unsubscribeToken: 'token-3',
          frequency: 'daily',
          confirmed: true,
        },
      ];

      mockSubscriptionRepository.findManyConfirmedByFrequency.mockResolvedValue(
        confirmedSubscriptions,
      );

      await service.scheduleDailyUpdates();

      expect(mockSubscriptionRepository.findManyConfirmedByFrequency).toHaveBeenCalledWith('daily');

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith({
        email: 'user3@example.com',
        city: 'Berlin',
        token: 'token-3',
        appUrl: 'http://localhost:3000',
      });
    });
  });
});
