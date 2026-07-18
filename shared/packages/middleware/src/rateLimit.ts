import rateLimit from 'express-rate-limit';

export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 100
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const strictRateLimiter = createRateLimiter(15 * 60 * 1000, 10);
export const standardRateLimiter = createRateLimiter(15 * 60 * 1000, 100);
