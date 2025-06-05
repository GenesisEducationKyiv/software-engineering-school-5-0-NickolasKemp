import { Test, TestingModule } from '@nestjs/testing';
import { WeatherUpdatesProcessor } from './weather-updates.processor';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';

describe('WeatherUpdatesProcessor', () => {
  let processor: WeatherUpdatesProcessor;
  let weatherService: WeatherService;
  let emailService: EmailService;

  const mockWeatherService = {
    getWeather: jest.fn(),
  };

  const mockEmailService = {
    sendWeatherUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherUpdatesProcessor,
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    processor = module.get<WeatherUpdatesProcessor>(WeatherUpdatesProcessor);
    weatherService = module.get<WeatherService>(WeatherService);
    emailService = module.get<EmailService>(EmailService);
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

      await processor.processWeatherUpdate(mockJob as any);

      expect(mockWeatherService.getWeather).toHaveBeenCalledWith('London');
      expect(mockEmailService.sendWeatherUpdate).toHaveBeenCalledWith(
        'user@example.com',
        'London',
        mockWeather,
        'unsubscribe-token',
        'http://localhost:3000',
      );
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

      await expect(processor.processWeatherUpdate(mockJob as any))
        .rejects.toThrow('City not found');
      
      expect(mockEmailService.sendWeatherUpdate).not.toHaveBeenCalled();
    });
  });
}); 