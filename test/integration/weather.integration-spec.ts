import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { WeatherApiClient } from '../../src/weather/weather-api.client';
import { mockWeatherApiClient } from '../mocks/weather-api.client.mock';
import { setupTestApp } from './setup-test-app';
import * as http from 'http';

describe('Weather API Integration Tests', () => {
  let app: INestApplication;
  let server: http.Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherApiClient)
      .useValue(mockWeatherApiClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await setupTestApp(app);

    server = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/weather', () => {
    it('should return weather data for a valid city', async () => {
      const response = await request(server)
        .get('/api/weather')
        .query({ city: 'London' })
        .expect(200);

      console.log('response', response.body);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('description');
    });

    it('should handle invalid city', async () => {
      mockWeatherApiClient.fetchWeatherData.mockRejectedValueOnce(new Error('City not found'));

      await request(server).get('/api/weather').query({ city: 'NonExistentCity123' }).expect(404);
    });
  });
});
