import { CachedWeatherService } from './cached-weather.service';
import { CacheService } from '../cache/cache.service';
import { WeatherService } from './weather.service';
import { MetricsService } from '../metrics/metrics.service';
import { WeatherData } from '../interfaces/weather.interface';

describe('CachedWeatherService', () => {
  let cachedWeatherService: CachedWeatherService;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMetricsService: jest.Mocked<MetricsService>;

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
    mockMetricsService = {
      incHit: jest.fn(),
      incMiss: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>;
    cachedWeatherService = new CachedWeatherService(
      mockWeatherService,
      mockCacheService,
      mockMetricsService,
    );
  });

  it('should return cached data and increment hit metric', async () => {
    mockCacheService.get.mockResolvedValue(weatherData);
    const result = await cachedWeatherService.getWeather(city);
    expect(result).toEqual(weatherData);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockMetricsService.incHit).toHaveBeenCalled();
    expect(mockMetricsService.incMiss).not.toHaveBeenCalled();
    expect(mockWeatherService.getWeather).not.toHaveBeenCalled();
  });

  it('should fetch, cache, and increment miss metric if cache is empty', async () => {
    mockCacheService.get.mockResolvedValue(undefined);
    mockWeatherService.getWeather.mockResolvedValue(weatherData);
    const result = await cachedWeatherService.getWeather(city);
    expect(result).toEqual(weatherData);
    expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(mockMetricsService.incMiss).toHaveBeenCalled();
    expect(mockMetricsService.incHit).not.toHaveBeenCalled();
    expect(mockWeatherService.getWeather).toHaveBeenCalledWith(city);
    expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, weatherData, 300);
  });
});
