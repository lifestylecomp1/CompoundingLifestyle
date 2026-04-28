import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireFeature.js';
import { listPartnersForAdmin, updatePartnerAccess, type Role } from '../db/index.js';
import { ALL_FEATURES, FEATURE_LABELS, isValidFeatureKey } from '../features.js';
import { getMaterialCatalog } from '../materialCatalog.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/partners', (_req: Request, res: Response) => {
  res.json({ partners: listPartnersForAdmin() });
});

router.patch('/partners/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const body = req.body as {
    role?: Role;
    allowed_features?: string[] | null;
    allowed_material_ids?: string[] | null;
  };
  const updates: {
    role?: Role;
    allowed_features?: string[] | null;
    allowed_material_ids?: string[] | null;
  } = {};

  if (body.role !== undefined) {
    if (!['admin', 'provider', 'sales_rep'].includes(body.role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    updates.role = body.role;
  }

  if (body.allowed_features !== undefined) {
    if (body.allowed_features === null) {
      updates.allowed_features = null;
    } else if (Array.isArray(body.allowed_features)) {
      const bad = body.allowed_features.find((k) => !isValidFeatureKey(k));
      if (bad) {
        res.status(400).json({ error: `Invalid feature key: ${bad}` });
        return;
      }
      updates.allowed_features = body.allowed_features;
    } else {
      res.status(400).json({ error: 'allowed_features must be an array or null' });
      return;
    }
  }

  if (body.allowed_material_ids !== undefined) {
    if (body.allowed_material_ids === null) {
      updates.allowed_material_ids = null;
    } else if (Array.isArray(body.allowed_material_ids)) {
      updates.allowed_material_ids = body.allowed_material_ids;
    } else {
      res.status(400).json({ error: 'allowed_material_ids must be an array or null' });
      return;
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updates' });
    return;
  }

  const row = updatePartnerAccess(id, updates);
  if (!row) {
    res.status(404).json({ error: 'Partner not found' });
    return;
  }
  res.json({ partner: row });
});

router.get('/features', (_req: Request, res: Response) => {
  res.json({
    features: ALL_FEATURES.map((key) => ({ key, label: FEATURE_LABELS[key] })),
  });
});

router.get('/material-catalog', (_req: Request, res: Response) => {
  res.json({ catalog: getMaterialCatalog() });
});

export default router;
