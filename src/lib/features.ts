/** Must match server `server/src/features.ts` */
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
