import { ConsoleLogger, LoggerService } from '@nestjs/common';

export class Logger implements LoggerService {
  private readonly baseLogger: ConsoleLogger;

  constructor(private readonly context: string) {
    this.baseLogger = new ConsoleLogger({
      json: true,
      colors: true,
      context: this.context,
    });
  }

  debug(message: string, context: string) {
    this.baseLogger.debug(message, context);
  }

  log(message: string) {
    this.baseLogger.log(message);
  }

  warn(message: string, context?: string) {
    this.baseLogger.warn(message, context);
  }

  error(message: string, error?: unknown) {
    const stack = error instanceof Error ? error.stack : String(error);
    this.baseLogger.error(message, stack);
  }
}
