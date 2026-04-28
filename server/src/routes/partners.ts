import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getPartnerById } from '../db/index.js';

const router = Router();

/** Get current partner info - partners never see other partners' data */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const partner = getPartnerById(req.partnerId!);
  if (!partner) {
    res.status(404).json({ error: 'Partner not found' });
    return;
  }
  res.json({
    partner: {
      id: partner.id,
      email: partner.email,
      name: partner.name,
      role: partner.role,
      allowedFeatures: partner.allowedFeatures,
    },
  });
});

export default router;
