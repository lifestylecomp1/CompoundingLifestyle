import { Request, Response, NextFunction } from 'express';
import { hasFeature, isAdmin } from '../db/index.js';
import type { FeatureKey } from '../features.js';

export function requireFeature(feature: FeatureKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.partnerId;
    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!hasFeature(id, feature)) {
      res.status(403).json({ error: 'You do not have access to this feature' });
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const id = req.partnerId;
  if (!id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!isAdmin(id)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
