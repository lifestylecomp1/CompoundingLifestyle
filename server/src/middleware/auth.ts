import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  partnerId: string;
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken =
    config.allowAuthQueryToken && typeof req.query?.token === 'string' ? req.query.token : null;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;
  if (!token) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.partnerId = payload.partnerId;
    req.partnerEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

declare global {
  namespace Express {
    interface Request {
      partnerId?: string;
      partnerEmail?: string;
    }
  }
}
