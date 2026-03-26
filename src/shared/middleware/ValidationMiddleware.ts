import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

type ValidationType = 'body' | 'query' | 'params';

export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query) as Record<string, string>;
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return validateRequest({ body: schema });
}

export function validateQuery<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return validateRequest({ query: schema });
}

export function validateParams<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return validateRequest({ params: schema });
}
