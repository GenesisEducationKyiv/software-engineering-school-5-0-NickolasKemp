import { Test } from '@nestjs/testing';
import { WeatherUpdatesProcessor } from '../app-services/weather-updates.processor';
import { EmailSender } from '../../domain/email.interface';
import { AbstractWeatherService } from '../../domain/weather.interface';
import { Job } from 'bull';
import { WeatherUpdateJob } from 'src/domain/task.interface';

describe('WeatherUpdatesProcessor', () => {
  let processor: WeatherUpdatesProcessor;
  let mockWeatherService: jest.Mocked<AbstractWeatherService>;
  let mockEmailSender: jest.Mocked<EmailSender>;

  beforeEach(async () => {
    mockWeatherService = {
      getWeather: jest.fn(),
    } as unknown as jest.Mocked<AbstractWeatherService>;
    mockEmailSender = {
      sendWeatherUpdate: jest.fn(),
      sendConfirmationEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailSender>;

    const module = await Test.createTestingModule({
      providers: [
        WeatherUpdatesProcessor,
        { provide: AbstractWeatherService, useValue: mockWeatherService },
        { provide: EmailSender, useValue: mockEmailSender },
      ],
    }).compile();

    processor = module.get<WeatherUpdatesProcessor>(WeatherUpdatesProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('processWeatherUpdate', () => {
    it('should fetch weather and send email update', async () => {
      const jobData = {
        email: 'user@example.com',
        city: 'London',
        token: 'unsubscribe-token',
        appUrl: 'http://localhost:3000',
      };

      const mockWeather = {
        temperature: 18,
        humidity: 70,
        description: 'Cloudy',
      };

      const mockJob = {
        data: jobData,
      };

      mockWeatherService.getWeather.mockResolvedValue(mockWeather);

      await processor.processWeatherUpdate(mockJob as Job<WeatherUpdateJob>);

      expect(mockWeatherService.getWeather).toHaveBeenCalledWith('London');
      expect(mockEmailSender.sendWeatherUpdate).toHaveBeenCalledWith('user@example.com', {
        city: 'London',
        weather: mockWeather,
        unsubscribeToken: 'unsubscribe-token',
        appUrl: 'http://localhost:3000',
      });
    });

    it('should handle errors from the weather service', async () => {
      const jobData = {
        email: 'user@example.com',
        city: 'InvalidCity',
        token: 'unsubscribe-token',
        appUrl: 'http://localhost:3000',
      };

      const mockJob = {
        data: jobData,
      };

      mockWeatherService.getWeather.mockRejectedValue(new Error('City not found'));

      await expect(
        processor.processWeatherUpdate(mockJob as Job<WeatherUpdateJob>),
      ).rejects.toThrow('City not found');

      expect(mockEmailSender.sendWeatherUpdate).not.toHaveBeenCalled();
    });
  });
});
