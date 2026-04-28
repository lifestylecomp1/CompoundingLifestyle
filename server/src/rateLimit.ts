import rateLimit from 'express-rate-limit';

/** Limit credential-guessing on POST /api/auth/login */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
