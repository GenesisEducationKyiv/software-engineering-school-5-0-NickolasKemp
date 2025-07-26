import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSenderController } from '../application-services/notification-sender.controller';
import { NotificationSenderService } from '../domain-services/notification-sender.service';
import { AbstractEmailSender } from '../domain-services/email-sender.interface';

describe('NotificationSenderController', () => {
  let notificationSenderController: NotificationSenderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSenderController],
      providers: [
        NotificationSenderService,
        {
          provide: AbstractEmailSender,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationSenderController = app.get<NotificationSenderController>(
      NotificationSenderController,
    );
  });

  describe('root', () => {
    it('should return "Hello World"', () => {
      expect(notificationSenderController.getHello()).toBe('Hello World');
    });
  });
});
