import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config.js';
import { getPartnerByEmail, createPartner, type Role } from '../db/index.js';
import { JwtPayload } from '../middleware/auth.js';
import { requireSeedPartnerSecret } from '../middleware/seedPartnerGate.js';
import { loginRateLimiter } from '../rateLimit.js';

const router = Router();

router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const partner = getPartnerByEmail(email);
  if (!partner) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const match = await bcrypt.compare(password, partner.password_hash);
  if (!match) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const payload: JwtPayload = { partnerId: partner.id, email: partner.email };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);

  res.json({
    token,
    partner: {
      id: partner.id,
      email: partner.email,
      name: partner.name,
      role: partner.role,
      allowedFeatures: partner.allowedFeatures,
    },
  });
});

// Bootstrap / dev only: requires X-Seed-Partner-Secret when SEED_PARTNER_SECRET is set; disabled in production without it
router.post('/seed-partner', requireSeedPartnerSecret, async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ error: 'Email, name, and password required' });
    return;
  }

  const existing = getPartnerByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Partner with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const id = randomUUID();
  const roleRaw = (req.body.role as string | undefined) ?? 'provider';
  const allowed_features = req.body.allowed_features as string[] | null | undefined;
  if (!['admin', 'provider', 'sales_rep'].includes(roleRaw)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }
  const partner = createPartner(
    id,
    email,
    name,
    passwordHash,
    roleRaw as Role,
    allowed_features ?? null,
    null,
  );

  res.status(201).json({ partner });
});

export default router;
