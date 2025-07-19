import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSenderController } from './notification-sender.controller';
import { NotificationSenderService } from './notification-sender.service';

describe('NotificationSenderController', () => {
  let notificationSenderController: NotificationSenderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSenderController],
      providers: [NotificationSenderService],
    }).compile();

    notificationSenderController = app.get<NotificationSenderController>(NotificationSenderController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(notificationSenderController.getHello()).toBe('Hello World!');
    });
  });
});
