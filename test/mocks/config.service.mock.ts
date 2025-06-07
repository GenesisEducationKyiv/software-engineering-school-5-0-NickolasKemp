import { Injectable } from '@nestjs/common';

@Injectable()
export class MockConfigService {
  private readonly configValues = {
    WEATHER_API_KEY: 'test-api-key',
    APP_URL: 'http://localhost:3000',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_USER: 'test-user',
    SMTP_PASS: 'test-password',
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
  };

  get(key: string): any {
    return this.configValues[key];
  }
}
