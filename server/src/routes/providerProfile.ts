import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireFeature } from '../middleware/requireFeature.js';
import { getProviderProfile, upsertProviderProfile, type ProviderProfile } from '../db/providerProfile.js';

const router = Router();

function pickBody(body: unknown): Partial<ProviderProfile> {
  if (!body || typeof body !== 'object') return {};
  const b = body as Record<string, unknown>;
  const s = (k: keyof ProviderProfile): string | undefined =>
    typeof b[k] === 'string' ? (b[k] as string) : undefined;

  const out: Partial<ProviderProfile> = {};
  const keys: (keyof Omit<ProviderProfile, 'updatedAt'>)[] = [
    'providerFirstName',
    'providerLastName',
    'title',
    'company',
    'providerEmail',
    'directPhone',
    'stateLicenseNumber',
    'licenseExpiration',
    'dea',
    'npi',
    'specialty',
    'shippingStreetAddress',
    'shippingCity',
    'shippingState',
    'shippingCountry',
    'shippingZipCode',
    'shippingEmail',
    'shippingPhone',
  ];
  for (const k of keys) {
    const v = s(k);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

router.get('/', requireAuth, requireFeature('provider_information'), (req: Request, res: Response) => {
  const profile = getProviderProfile(req.partnerId!);
  res.json({ profile });
});

router.put('/', requireAuth, requireFeature('provider_information'), (req: Request, res: Response) => {
  const patch = pickBody(req.body);
  const profile = upsertProviderProfile(req.partnerId!, patch);
  res.json({ profile });
});

export default router;
