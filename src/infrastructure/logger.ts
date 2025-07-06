import { LoggerService, Logger as NestLogger } from '@nestjs/common';

export class Logger implements LoggerService {
  private readonly baseLogger: NestLogger;

  constructor(private readonly context: string) {
    this.baseLogger = new NestLogger(context);
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
