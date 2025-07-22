import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationSenderModule } from '../src/infrastructure/notification-sender.module';
import { Http2Server } from 'http2';

describe('NotificationSenderController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationSenderModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer() as Http2Server)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
