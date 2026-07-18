import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('gateway-middleware');

const publicPaths = [
  '/api-docs',
  '/health',
  '/metrics',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

const publicPathPatterns = [
  /^\/auth\/health$/,
];

export const isPublicPath = (path: string): boolean => {
  if (publicPaths.some(p => path.startsWith(p))) return true;
  if (publicPathPatterns.some(p => p.test(path))) return true;
  return false;
};

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (isPublicPath(req.path)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'No token provided',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid token',
    });
  }
};

export const errorHandler = (
  err: Error,
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

  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
