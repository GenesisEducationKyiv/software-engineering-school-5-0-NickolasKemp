import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../src/email/email.service';


jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      current: {
        temp_c: 21,
        humidity: 65,
        condition: {
          text: 'Sunny',
        },
      },
    },
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('test-confirmation-token')
    .mockReturnValueOnce('test-unsubscribe-token'),
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendWeatherUpdate: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key) => {
          switch (key) {
            case 'WEATHER_API_KEY':
              return 'test-api-key';
            case 'APP_URL':
              return 'http://localhost:3000';
            case 'SMTP_HOST':
              return 'smtp.example.com';
            case 'SMTP_PORT':
              return 587;
            case 'SMTP_USER':
              return 'test-user';
            case 'SMTP_PASS':
              return 'test-password';
            case 'REDIS_HOST':
              return 'localhost';
            case 'REDIS_PORT':
              return 6379;
            default:
              return null;
          }
        }),
      })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));
    
    await app.init();

    try {
      await prismaService.subscription.deleteMany({});
    } catch (error) {
      console.error('Failed to clear database: ', error);
    }
  });

  afterAll(async () => {
    try {
      await prismaService.subscription.deleteMany({});
    } catch (error) {
      console.error('Failed to clean up database: ', error);
    }
    await app.close();
  });

  describe('/api/weather (GET)', () => {
    it('should return weather data for a valid city', () => {
      return request(app.getHttpServer())
        .get('/api/weather?city=London')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual({
            temperature: 21,
            humidity: 65,
            description: 'Sunny',
          });
        });
    });

    it('should return 400 when city parameter is missing', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('City is required');
        });
    });
  });

  describe('Subscription Flow', () => {
    it('should handle subscribe, confirm, and unsubscribe operations', async () => {
      const subscribeResponse = await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
        })
        .expect(HttpStatus.OK);

      expect(subscribeResponse.body.message).toContain('Confirmation email sent');

      const subscription = await prismaService.subscription.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(subscription).toBeDefined();
      expect(subscription!.email).toBe('test@example.com');
      expect(subscription!.city).toBe('London');
      expect(subscription!.frequency).toBe('daily');
      expect(subscription!.confirmed).toBe(false);
      expect(subscription!.confirmationToken).toBe('test-confirmation-token');
      expect(subscription!.unsubscribeToken).toBe('test-unsubscribe-token');

      await request(app.getHttpServer())
        .get(`/api/confirm/${subscription!.confirmationToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Subscription confirmed successfully');
        });

      const confirmedSubscription = await prismaService.subscription.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(confirmedSubscription!.confirmed).toBe(true);
      expect(confirmedSubscription!.confirmationToken).toBeNull();

      await request(app.getHttpServer())
        .get(`/api/unsubscribe/${subscription!.unsubscribeToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Unsubscribed successfully');
        });

      const deletedSubscription = await prismaService.subscription.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(deletedSubscription).toBeNull();
    });

    it('should return 400 for invalid subscription data', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'test@example.com',
          frequency: 'weekly',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 for invalid confirmation token', () => {
      return request(app.getHttpServer())
        .get('/api/confirm/invalid-token')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 for invalid unsubscribe token', () => {
      return request(app.getHttpServer())
        .get('/api/unsubscribe/invalid-token')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
}); 