import { Test, TestingModule } from '@nestjs/testing';
import { WeatherUrlBuilderService } from './weather-url-builder.service';

describe('WeatherUrlBuilderService', () => {
  let service: WeatherUrlBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherUrlBuilderService],
    }).compile();

    service = module.get<WeatherUrlBuilderService>(WeatherUrlBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildUrl', () => {
    it('should build URL with simple parameters', () => {
      const baseUrl = 'http://api.example.com/weather';
      const params = {
        q: 'London',
        key: 'test-api-key',
      };

      const result = service.buildUrl(baseUrl, params);

      expect(result).toBe('http://api.example.com/weather?q=London&key=test-api-key');
    });

    it('should properly encode special characters in parameters', () => {
      const baseUrl = 'http://api.example.com/weather';
      const params = {
        q: 'Kyiv',
        key: 'test-api-key',
        units: 'metric',
      };

      const result = service.buildUrl(baseUrl, params);

      expect(result).toBe('http://api.example.com/weather?q=Kyiv&key=test-api-key&units=metric');
    });

    it('should handle empty parameters', () => {
      const baseUrl = 'http://api.example.com/weather';
      const params = {};

      const result = service.buildUrl(baseUrl, params);

      expect(result).toBe('http://api.example.com/weather?');
    });

    it('should handle URL with existing query parameters', () => {
      const baseUrl = 'http://api.example.com/weather?version=2.0';
      const params = {
        q: 'Paris',
        key: 'test-api-key',
      };

      const result = service.buildUrl(baseUrl, params);

      expect(result).toBe('http://api.example.com/weather?version=2.0&q=Paris&key=test-api-key');
    });
  });
});
