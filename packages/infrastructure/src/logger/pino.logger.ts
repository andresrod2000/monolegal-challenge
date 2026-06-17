import pino from 'pino';
import type { ILogger, LogContext } from '@monolegal/domain';

export class PinoLogger implements ILogger {
  private logger: pino.Logger;

  constructor(service: string, level: pino.Level = 'info', existingLogger?: pino.Logger) {
    if (existingLogger) {
      this.logger = existingLogger;
      return;
    }

    const isDev = process.env.NODE_ENV !== 'production';
    this.logger = pino({
      level,
      base: { service },
      ...(isDev && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }),
    });
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(context ?? {}, message);
  }

  child(context: LogContext): ILogger {
    return new PinoLogger('', 'info', this.logger.child(context));
  }
}
