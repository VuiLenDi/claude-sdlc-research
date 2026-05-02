import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof ZodError) {
    const first = err.errors[0];
    return res.status(400).json({
      message: first.message,
      code: 'VALIDATION_ERROR',
      field: first.path.join('.'),
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
