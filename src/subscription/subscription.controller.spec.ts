import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { WeatherService } from '../weather/weather.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: SubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: {
            subscribe: jest.fn(),
            confirm: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should call subscriptionService.subscribe with correct parameters', async () => {
      const dto: CreateSubscriptionDto = {
        email: 'test@example.com',
        city: 'London',
        frequency: 'daily',
      };
      const expectedResponse = { message: 'Subscription successful. Confirmation email sent.' };

      (service.subscribe as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await controller.subscribe(dto);

      expect(service.subscribe as jest.Mock).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('confirm', () => {
    it('should call subscriptionService.confirm with correct token', async () => {
      const token = 'valid-token';
      const expectedResponse = { message: 'Subscription confirmed successfully' };

      const result = await controller.confirm(token);

      expect(service.confirm as jest.Mock).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if token is not provided', async () => {
      await expect(controller.confirm('')).rejects.toThrow(BadRequestException);
      expect(service.confirm as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should call subscriptionService.unsubscribe with correct token', async () => {
      const token = 'valid-token';
      const expectedResponse = { message: 'Unsubscribed successfully' };

      const result = await controller.unsubscribe(token);

      expect(service.unsubscribe as jest.Mock).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if token is not provided', async () => {
      await expect(controller.unsubscribe('')).rejects.toThrow(BadRequestException);
      expect(service.unsubscribe as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
