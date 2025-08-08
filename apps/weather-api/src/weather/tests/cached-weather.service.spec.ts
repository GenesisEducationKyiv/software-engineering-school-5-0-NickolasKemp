import { CachedWeatherService } from '../infrastructure/cached-weather.service';
import { CacheService } from '../../../../../shared/src/infrastructure/cache/cache.service';
import { WeatherService } from '../domain-services/weather.service';
import { AbstractWeatherMetrics } from '../metrics/domain-services/weather-metrics.interface';
import { WeatherData } from '../domain/weather.interface';

describe('CachedWeatherService', () => {
  let cachedWeatherService: CachedWeatherService;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockWeatherMetrics: jest.Mocked<AbstractWeatherMetrics>;

  const city = 'London';
  const cacheKey = `weather:${city.toLowerCase()}`;
  const weatherData: WeatherData = {
    temperature: 20,
    humidity: 60,
    description: 'Sunny',
  };

  beforeEach(() => {
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;
    mockWeatherService = {
      getWeather: jest.fn(),
    } as unknown as jest.Mocked<WeatherService>;
    mockWeatherMetrics = {
      recordCacheHit: jest.fn(),
      recordCacheMiss: jest.fn(),
      recordWeatherProviderCall: jest.fn(),
    } as unknown as jest.Mocked<AbstractWeatherMetrics>;
    cachedWeatherService = new CachedWeatherService(
      mockWeatherService,
      mockCacheService,
      mockWeatherMetrics,
    );
  });

  it('should return cached data and increment hit metric', async () => {
    mockCacheService.get.mockResolvedValue(weatherData);
    const result = await cachedWeatherService.getWeather(city);
    expect(result).toEqual(weatherData);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockWeatherMetrics.recordCacheHit).toHaveBeenCalled();
    expect(mockWeatherMetrics.recordCacheMiss).not.toHaveBeenCalled();
    expect(mockWeatherService.getWeather).not.toHaveBeenCalled();
  });

  it('should fetch, cache, and increment miss metric if cache is empty', async () => {
    mockCacheService.get.mockResolvedValue(undefined);
    mockWeatherService.getWeather.mockResolvedValue(weatherData);
    const result = await cachedWeatherService.getWeather(city);
    expect(result).toEqual(weatherData);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockWeatherMetrics.recordCacheMiss).toHaveBeenCalled();
    expect(mockWeatherMetrics.recordCacheHit).not.toHaveBeenCalled();
    expect(mockWeatherService.getWeather).toHaveBeenCalledWith(city);
    expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, weatherData, 300);
  });
});
