import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError, createLogger } from '@medibook/utils';

const logger = createLogger('error-handler');

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ZodError) {
    sendError(res, 400, 'VALIDATION_ERROR', err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 401, 'INVALID_TOKEN', 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 401, 'TOKEN_EXPIRED', 'Token expired');
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  sendError(res, statusCode, err.code || 'SERVER_ERROR', message);
};
