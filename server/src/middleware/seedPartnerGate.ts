import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

const HEADER = 'x-seed-partner-secret';

function headerSecret(req: Request): string | undefined {
  const raw = req.headers[HEADER];
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return undefined;
}

/** Blocks unauthenticated partner seeding in production; optional shared secret in development */
export function requireSeedPartnerSecret(req: Request, res: Response, next: NextFunction) {
  if (config.nodeEnv === 'production') {
    if (!config.seedPartnerSecret) {
      res.status(403).json({ error: 'Partner seeding is disabled in production' });
      return;
    }
    if (headerSecret(req) !== config.seedPartnerSecret) {
      res.status(403).json({ error: 'Invalid or missing seed secret' });
      return;
    }
    next();
    return;
  }

  if (config.seedPartnerSecret && headerSecret(req) !== config.seedPartnerSecret) {
    res.status(403).json({ error: 'Invalid or missing seed secret' });
    return;
  }
  next();
}
