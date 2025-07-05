import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { WeatherLogger } from './weather-logger';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('WeatherLogger', () => {
  let service: WeatherLogger;
  let mockFs: jest.Mocked<typeof fs>;
  let mockPath: jest.Mocked<typeof path>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherLogger],
    }).compile();

    service = module.get<WeatherLogger>(WeatherLogger);
    mockFs = fs as jest.Mocked<typeof fs>;
    mockPath = path as jest.Mocked<typeof path>;

    mockPath.join.mockReturnValue('/test/path/weather-provider-logs.jsonl');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logProviderResponse', () => {
    it('should log successful response to file', () => {
      const providerName = 'test-provider';
      const city = 'London';
      const response = { temperature: 20, humidity: 60 };

      service.logProviderResponse(providerName, city, response);

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        '/test/path/weather-provider-logs.jsonl',
        expect.stringContaining('"provider":"test-provider"'),
      );
    });

    it('should log error response to file', () => {
      const providerName = 'test-provider';
      const city = 'London';
      const error = new Error('API Error');

      service.logProviderResponse(providerName, city, error, true);

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        '/test/path/weather-provider-logs.jsonl',
        expect.stringContaining('"type":"error"'),
      );
    });

    it('should handle file write errors gracefully', () => {
      const providerName = 'test-provider';
      const city = 'London';
      const response = { temperature: 20 };

      mockFs.appendFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      service.logProviderResponse(providerName, city, response);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to write to weather log file',
        expect.any(String),
      );
    });
  });
});
