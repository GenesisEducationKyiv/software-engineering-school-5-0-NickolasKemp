import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;
  let weatherQueue: any;

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

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
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
    prismaService = module.get<PrismaService>(PrismaService);
    weatherQueue = module.get(getQueueToken('weather-updates'));
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

      mockPrismaService.subscription.findMany.mockResolvedValue(confirmedSubscriptions);

      await service.scheduleHourlyUpdates();

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: { confirmed: true, frequency: 'hourly' },
      });

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
      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      await service.scheduleHourlyUpdates();

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: { confirmed: true, frequency: 'hourly' },
      });
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

      mockPrismaService.subscription.findMany.mockResolvedValue(confirmedSubscriptions);

      await service.scheduleDailyUpdates();

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: { confirmed: true, frequency: 'daily' },
      });

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