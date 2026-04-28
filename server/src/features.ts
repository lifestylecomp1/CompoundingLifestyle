/** App feature keys — must match frontend `src/lib/features.ts` */
export const FEATURE_KEYS = [
  'catalog_pricing',
  'clinical_education',
  'state_licenses',
  'provider_information',
  'dosing',
  'coas',
  'patient_education',
  'products',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const ALL_FEATURES: FeatureKey[] = [...FEATURE_KEYS];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  catalog_pricing: 'Catalog & Pricing',
  clinical_education: 'Clinical Education',
  state_licenses: 'State Licenses',
  provider_information: 'Provider information',
  dosing: 'Dosing Guides',
  coas: 'CoAs',
  patient_education: 'Patient Education',
  products: 'Product Reference',
};

/** Map material file id → feature (for GET /materials/file/:id) */
export function getFeatureForMaterialId(materialId: string): FeatureKey | null {
  if (materialId.startsWith('brochure-')) return 'patient_education';
  if (materialId.startsWith('cat-') || materialId.startsWith('price-')) return 'catalog_pricing';
  if (materialId.startsWith('mon-')) return 'clinical_education';
  if (materialId.startsWith('license-')) return 'state_licenses';
  if (materialId.startsWith('dose-')) return 'dosing';
  if (materialId.startsWith('coa-')) return 'coas';
  if (materialId.startsWith('pe-')) return 'patient_education';
  return null;
}

export function isValidFeatureKey(k: string): k is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(k);
}
