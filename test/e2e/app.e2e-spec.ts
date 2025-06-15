import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../src/email/email.service';
import { MockPrismaService } from '../mocks/prisma.service.mock';
import { MockConfigService } from '../mocks/config.service.mock';
import { WeatherService } from '../../src/weather/weather.service';
import { MockWeatherService } from '../mocks/weather.service.mock';

const TEST_EMAIL = 'test@example.com';
const TEST_CITY = 'London';
const TEST_CONFIRM_TOKEN = 'valid-confirmation-token';
const TEST_UNSUB_TOKEN = 'valid-unsubscribe-token';
const LIFECYCLE_EMAIL = 'lifecycle@example.com';
const LIFECYCLE_CITY = 'Paris';

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prismaService: MockPrismaService;

  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendWeatherUpdate: jest.fn().mockResolvedValue(undefined),
  };

  const createTestModule = async (): Promise<TestingModule> => {
    return Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useClass(MockConfigService)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .overrideProvider(PrismaService)
      .useClass(MockPrismaService)
      .overrideProvider(WeatherService)
      .useClass(MockWeatherService)
      .compile();
  };

  beforeAll(async (): Promise<void> => {
    const moduleFixture = await createTestModule();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<MockPrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  beforeEach((): void => {
    jest.resetModules();
    jest.clearAllMocks();
    prismaService.subscription.deleteMany();
  });

  describe('/api/weather (GET)', () => {
    it('should return weather data for a valid city', () => {
      return request(app.getHttpServer())
        .get(`/api/weather?city=${TEST_CITY}`)
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

    it('should return 404 when weather service fails', () => {
      const mockWeatherService = app.get<MockWeatherService>(WeatherService);
      jest.spyOn(mockWeatherService, 'getWeather').mockRejectedValueOnce(new Error('API error'));

      return request(app.getHttpServer())
        .get(`/api/weather?city=${TEST_CITY}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toContain('City not found or weather service unavailable');
        });
    });
  });

  describe('Subscription Flow', () => {
    it('should handle subscribe operation with valid data', async () => {
      const subscribeResponse = await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(HttpStatus.OK);

      expect(subscribeResponse.body.message).toContain('Confirmation email sent');
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        TEST_EMAIL,
        expect.objectContaining({
          token: expect.any(String),
          appUrl: expect.any(String),
        }),
      );

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(subscription).toBeDefined();
      expect(subscription?.email).toBe(TEST_EMAIL);
      expect(subscription?.city).toBe(TEST_CITY);
      expect(subscription?.frequency).toBe('daily');
      expect(subscription?.confirmed).toBe(false);
    });

    it('should handle duplicate subscription', async () => {
      await prismaService.subscription.create({
        data: {
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
          confirmationToken: TEST_CONFIRM_TOKEN,
          unsubscribeToken: TEST_UNSUB_TOKEN,
          confirmed: false,
        },
      });

      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: 'Paris',
          frequency: 'hourly',
        })
        .expect(HttpStatus.CONFLICT);

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(subscription?.city).toBe(TEST_CITY);
      expect(subscription?.frequency).toBe('daily');
    });

    it('should handle confirmation with valid token', async () => {
      await prismaService.subscription.create({
        data: {
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
          confirmationToken: TEST_CONFIRM_TOKEN,
          unsubscribeToken: TEST_UNSUB_TOKEN,
          confirmed: false,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/confirm/${TEST_CONFIRM_TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Subscription confirmed successfully');
        });

      const confirmedSubscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(confirmedSubscription?.confirmed).toBe(true);
      expect(confirmedSubscription?.confirmationToken).toBeNull();
    });

    it('should handle unsubscribe with valid token', async () => {
      await prismaService.subscription.create({
        data: {
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
          confirmed: true,
          unsubscribeToken: TEST_UNSUB_TOKEN,
          confirmationToken: null,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/unsubscribe/${TEST_UNSUB_TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Unsubscribed successfully');
        });

      const deletedSubscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(deletedSubscription).toBeNull();
    });

    it('should return 400 for invalid subscription data', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'invalid-email',
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for missing required fields in subscription', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          frequency: 'daily',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for invalid frequency value', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
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

    it('should return 404 for missing token parameter', () => {
      return request(app.getHttpServer()).get('/api/confirm/').expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 for missing unsubscribe token parameter', () => {
      return request(app.getHttpServer()).get('/api/unsubscribe/').expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Complete subscription flow', () => {
    it('should handle the entire subscription lifecycle', async () => {
      const confirmToken = 'test-confirmation-token';
      const unsubscribeToken = 'test-unsubscribe-token';

      await prismaService.subscription.create({
        data: {
          email: LIFECYCLE_EMAIL,
          city: LIFECYCLE_CITY,
          frequency: 'daily',
          confirmed: false,
          confirmationToken: confirmToken,
          unsubscribeToken: unsubscribeToken,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/confirm/${confirmToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Subscription confirmed successfully');
        });

      const confirmedSubscription = await prismaService.subscription.findUnique({
        where: { email: LIFECYCLE_EMAIL },
      });

      expect(confirmedSubscription?.confirmed).toBe(true);
      expect(confirmedSubscription?.confirmationToken).toBeNull();

      await request(app.getHttpServer())
        .get(`/api/unsubscribe/${unsubscribeToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('Unsubscribed successfully');
        });

      const deletedSubscription = await prismaService.subscription.findUnique({
        where: { email: LIFECYCLE_EMAIL },
      });

      expect(deletedSubscription).toBeNull();
    });
  });
});
