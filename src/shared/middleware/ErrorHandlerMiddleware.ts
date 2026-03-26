import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../errors/AppError';
import { Logger } from '../logger';
import { ApiResponse } from '../../application/dtos';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(400).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: (err as AppError & { details?: unknown }).details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    Logger.warn(`Application error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json(response);
    return;
  }

  Logger.error(`Unexpected error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  res.status(500).json(response);
}
