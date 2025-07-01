export interface WeatherUpdateJob {
  email: string;
  city: string;
  token: string;
  appUrl: string;
}

export interface Scheduler {
  scheduleHourlyUpdates(): Promise<void>;
  scheduleDailyUpdates(): Promise<void>;
}
