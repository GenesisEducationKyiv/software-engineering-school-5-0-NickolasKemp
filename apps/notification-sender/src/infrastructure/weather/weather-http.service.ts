import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

export interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  [key: string]: any;
}

@Injectable()
export class WeatherHttpService {
  private readonly weatherApiUrl =
    process.env.WEATHER_API_URL || 'http://localhost:3000/api/weather';

  async getWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherData>(this.weatherApiUrl, {
        params: { city },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number }; message?: string };

      if (!axiosError?.response?.status) {
        throw new Error('Unknown error', { cause: error });
      }

      if (axiosError.response.status === 404) {
        throw new NotFoundException('City not found');
      }
      throw new Error(`Failed to fetch weather for city "${city}": ${axiosError.message}`);
    }
  }
}
