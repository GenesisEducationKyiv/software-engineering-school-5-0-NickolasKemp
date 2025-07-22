import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from '../application-services/scheduler.service';
import { WeatherUpdateFacade } from '@subscription/facade/weather-update.facade';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: WeatherUpdateFacade,
          useValue: {
            sendHourlyWeatherUpdates: jest.fn(),
            sendDailyWeatherUpdates: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduleHourlyUpdates', () => {
    it('should call weatherUpdateFacade.sendHourlyWeatherUpdates', async () => {
      const weatherUpdateFacadeMock = module.get(WeatherUpdateFacade);

      await service.scheduleHourlyUpdates();

      expect(weatherUpdateFacadeMock.sendHourlyWeatherUpdates).toHaveBeenCalled();
    });
  });

  describe('scheduleDailyUpdates', () => {
    it('should call weatherUpdateFacade.sendDailyWeatherUpdates', async () => {
      const weatherUpdateFacadeMock = module.get(WeatherUpdateFacade);

      await service.scheduleDailyUpdates();

      expect(weatherUpdateFacadeMock.sendDailyWeatherUpdates).toHaveBeenCalled();
    });
  });
});
