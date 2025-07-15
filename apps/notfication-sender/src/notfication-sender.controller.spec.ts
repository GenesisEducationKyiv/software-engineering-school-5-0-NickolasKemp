import { Test, TestingModule } from '@nestjs/testing';
import { NotficationSenderController } from './notfication-sender.controller';
import { NotficationSenderService } from './notfication-sender.service';

describe('NotficationSenderController', () => {
  let notficationSenderController: NotficationSenderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotficationSenderController],
      providers: [NotficationSenderService],
    }).compile();

    notficationSenderController = app.get<NotficationSenderController>(NotficationSenderController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(notficationSenderController.getHello()).toBe('Hello World!');
    });
  });
});
