import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req) => process.env.NODE_ENV === 'development',
  });
};

export const globalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again after 15 minutes'
);

export const authLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many login attempts, please try again after 15 minutes'
);

export const exerciseLimiter = createLimiter(
  60 * 60 * 1000,
  200,
  'Too many exercise operations, please try again after 1 hour'
);
