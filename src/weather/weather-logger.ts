import { Injectable } from '@nestjs/common';
import { Logger } from 'src/infrastructure/logger';
import * as fs from 'fs';
import * as path from 'path';
import { OpenWeatherMapResponse, WeatherApiResponse } from 'src/interfaces/weather.interface';

@Injectable()
export class WeatherLogger {
  private readonly logger = new Logger(WeatherLogger.name);
  private readonly logFilePath = path.join(process.cwd(), 'weather-provider-logs.jsonl');

  logProviderResponse(
    providerName: string,
    city: string,
    response: Error | OpenWeatherMapResponse | WeatherApiResponse,
    isError = false,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider: providerName,
      city,
      type: isError ? 'error' : 'response',
      data: isError
        ? { message: (response as Error).message, stack: (response as Error).stack }
        : response,
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(this.logFilePath, logLine);
      this.logger.log(
        `${providerName} - ${isError ? 'Error' : 'Response'}: ${JSON.stringify(response)}`,
      );
    } catch (error) {
      this.logger.error('Failed to write to weather log file', error);
    }
  }
}
