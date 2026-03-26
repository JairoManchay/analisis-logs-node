import pino from 'pino';
import { ILogger } from './ILogger';
import { AppConfig } from '../config/AppConfig';

class PinoLogger implements ILogger {
  private static instance: PinoLogger;
  private readonly logger: pino.Logger;

  private constructor() {
    const config = AppConfig.getInstance();
    
    this.logger = pino({
      level: config.logLevel,
      transport: config.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      formatters: {
        level: (label) => ({ level: label }),
      },
      base: {
        service: 'log-analyzer',
      },
    });
  }

  static getInstance(): PinoLogger {
    if (!PinoLogger.instance) {
      PinoLogger.instance = new PinoLogger();
    }
    return PinoLogger.instance;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info({ ...meta }, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn({ ...meta }, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error({ ...meta }, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug({ ...meta }, message);
  }

  trace(message: string, meta?: Record<string, unknown>): void {
    this.logger.trace({ ...meta }, message);
  }
}

export const Logger = PinoLogger.getInstance();
