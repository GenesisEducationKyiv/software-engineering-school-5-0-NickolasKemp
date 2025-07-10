import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { setupTestApp } from './setup-test-app';
import * as http from 'http';
import { WeatherClient } from 'src/weather/weather-client';
import { mockWeatherClient } from '../mocks/weather-client.mock';

interface ApiResponse {
  message?: string;
}

describe('Subscription API Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let server: http.Server;

  const TEST_EMAIL = 'test@example.com';
  const TEST_CITY = 'London';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherClient)
      .useValue(mockWeatherClient)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestApp(app);
    server = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prismaService.subscription.deleteMany();
  });

  describe('POST /api/subscribe', () => {
    it('should create a new subscription', async () => {
      const response = await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(200);

      console.log('Subscribe Response:', JSON.stringify(response.body, null, 2));

      expect((response.body as ApiResponse).message).toContain('Confirmation email sent');

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(subscription).toBeDefined();
      expect(subscription?.email).toBe(TEST_EMAIL);
      expect(subscription?.city).toBe(TEST_CITY);
      expect(subscription?.frequency).toBe('daily');
      expect(subscription?.confirmed).toBe(false);
      expect(subscription?.confirmationToken).toBeDefined();
      expect(subscription?.unsubscribeToken).toBeDefined();
    });

    it('should handle duplicate subscription', async () => {
      await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(200);

      const response = await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: 'Paris',
          frequency: 'hourly',
        })
        .expect(409);

      console.log('Duplicate Subscription Response:', JSON.stringify(response.body, null, 2));

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(subscription?.city).toBe(TEST_CITY);
      expect(subscription?.frequency).toBe('daily');
    });

    it('should validate invalid email', async () => {
      const response = await request(server)
        .post('/api/subscribe')
        .send({
          email: 'invalid-email',
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(400);

      console.log('Invalid Email Response:', JSON.stringify(response.body, null, 2));
      expect((response.body as ApiResponse).message).toContain('email must be an email');
    });

    it('should validate invalid frequency', async () => {
      const response = await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'weekly',
        })
        .expect(400);

      console.log('Invalid Frequency Response:', JSON.stringify(response.body, null, 2));
      expect((response.body as ApiResponse).message).toContain(
        'frequency must be one of the following values: hourly, daily',
      );
    });
  });

  describe('GET /api/confirm/:token', () => {
    it('should confirm subscription with valid token', async () => {
      await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(200);

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      const response = await request(server)
        .get(`/api/confirm/${subscription?.confirmationToken}`)
        .expect(200);

      console.log('Confirmation Response:', JSON.stringify(response.body, null, 2));

      expect((response.body as ApiResponse).message).toContain(
        'Subscription confirmed successfully',
      );

      const confirmedSubscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(confirmedSubscription?.confirmed).toBe(true);
      expect(confirmedSubscription?.confirmationToken).toBeNull();
    });

    it('should handle invalid confirmation token', async () => {
      const response = await request(server).get('/api/confirm/invalid-token').expect(404);

      console.log('Invalid Token Response:', JSON.stringify(response.body, null, 2));
      expect((response.body as ApiResponse).message).toContain('Confirmation token not found');
    });
  });

  describe('GET /api/unsubscribe/:token', () => {
    it('should unsubscribe with valid token', async () => {
      await request(server)
        .post('/api/subscribe')
        .send({
          email: TEST_EMAIL,
          city: TEST_CITY,
          frequency: 'daily',
        })
        .expect(200);

      const subscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      await request(server).get(`/api/confirm/${subscription?.confirmationToken}`).expect(200);

      const response = await request(server)
        .get(`/api/unsubscribe/${subscription?.unsubscribeToken}`)
        .expect(200);

      console.log('Unsubscribe Response:', JSON.stringify(response.body, null, 2));

      expect((response.body as ApiResponse).message).toContain('Unsubscribed successfully');

      const deletedSubscription = await prismaService.subscription.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(deletedSubscription).toBeNull();
    });

    it('should handle invalid unsubscribe token', async () => {
      const response = await request(server).get('/api/unsubscribe/invalid-token').expect(404);

      console.log('Invalid Unsubscribe Token Response:', JSON.stringify(response.body, null, 2));
      expect((response.body as ApiResponse).message).toContain('Unsubscribe token not found');
    });
  });
});
