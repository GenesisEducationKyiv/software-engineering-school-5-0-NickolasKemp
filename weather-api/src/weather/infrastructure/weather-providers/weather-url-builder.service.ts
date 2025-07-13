import { Injectable } from '@nestjs/common';

@Injectable()
export class WeatherUrlBuilderService {
  buildUrl(baseUrl: string, params: Record<string, string>): string {
    const urlParams = new URLSearchParams(params);
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${urlParams.toString()}`;
  }
}
