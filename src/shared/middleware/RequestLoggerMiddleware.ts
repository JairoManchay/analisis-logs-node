import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      Logger.warn(`HTTP ${req.method} ${req.path} ${res.statusCode}`, logData);
    } else {
      Logger.info(`HTTP ${req.method} ${req.path} ${res.statusCode}`, logData);
    }
  });

  next();
}
