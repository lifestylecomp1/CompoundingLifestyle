import { loadMonographs } from './db/monographs.js';
import type { FeatureKey } from './features.js';
import { FEATURE_LABELS } from './features.js';

export type CatalogGroup = {
  feature: FeatureKey;
  featureLabel: string;
  items: { id: string; label: string }[];
};

/** All downloadable / listable material ids grouped by feature (for admin UI + validation). */
export function getMaterialCatalog(): CatalogGroup[] {
  return [
    {
      feature: 'catalog_pricing',
      featureLabel: FEATURE_LABELS.catalog_pricing,
      items: [
        { id: 'cat-2', label: 'Spring 2026 Catalog' },
        { id: 'cat-6', label: 'Peptides' },
        { id: 'price-1', label: 'Volume Pricing Sheet Spring 2026' },
        { id: 'price-2', label: 'Product Descriptions' },
        { id: 'price-3', label: 'Product Blurbs' },
      ],
    },
    {
      feature: 'clinical_education',
      featureLabel: FEATURE_LABELS.clinical_education,
      items: loadMonographs().map((m) => ({ id: m.id, label: m.name })),
    },
    {
      feature: 'state_licenses',
      featureLabel: FEATURE_LABELS.state_licenses,
      items: [
        { id: 'license-ak', label: 'Alaska' },
        { id: 'license-az', label: 'Arizona' },
        { id: 'license-co', label: 'Colorado' },
        { id: 'license-ct', label: 'Connecticut' },
        { id: 'license-de', label: 'Delaware' },
        { id: 'license-fl', label: 'Florida' },
        { id: 'license-hi', label: 'Hawaii' },
        { id: 'license-id', label: 'Idaho' },
        { id: 'license-il', label: 'Illinois' },
        { id: 'license-me', label: 'Maine' },
        { id: 'license-nh', label: 'New Hampshire' },
        { id: 'license-nm', label: 'New Mexico' },
        { id: 'license-ny', label: 'New York' },
        { id: 'license-oh', label: 'Ohio' },
        { id: 'license-ri', label: 'Rhode Island' },
        { id: 'license-ut', label: 'Utah' },
        { id: 'license-wi', label: 'Wisconsin' },
        { id: 'license-wy', label: 'Wyoming' },
      ],
    },
    {
      feature: 'dosing',
      featureLabel: FEATURE_LABELS.dosing,
      items: [
        { id: 'dose-1', label: 'B6 Tirz Dosing Guide' },
        { id: 'dose-2', label: 'Semaglutide L-Carnitine Dosing' },
      ],
    },
    {
      feature: 'coas',
      featureLabel: FEATURE_LABELS.coas,
      items: [
        { id: 'coa-1', label: 'Tirzepatide COA' },
        { id: 'coa-2', label: 'Semaglutide COA' },
        { id: 'coa-3', label: 'Sema L-Carnitine COA' },
        { id: 'coa-4', label: 'Tirz B6 Validation' },
        { id: 'coa-5', label: 'Tirzepatide Analysis' },
      ],
    },
    {
      feature: 'patient_education',
      featureLabel: FEATURE_LABELS.patient_education,
      items: [
        { id: 'brochure-1', label: 'GHK-Cu Brochure' },
        { id: 'brochure-2', label: 'Patient NAD Brochure' },
        { id: 'pe-1', label: 'GLP-1 / GIP Differences' },
        { id: 'pe-2', label: 'Semaglutide' },
        { id: 'pe-3', label: 'Tirzepatide' },
        { id: 'pe-4', label: 'Dulaglutide' },
        { id: 'pe-5', label: 'Male HRT' },
        { id: 'pe-6', label: 'Female HRT' },
        { id: 'pe-7', label: 'Sexual Health' },
        { id: 'pe-8', label: 'B12 Shots vs Lipo-MIC' },
        { id: 'pe-9', label: 'MIC Lipotropic Injections' },
        { id: 'pe-10', label: 'Infusion Pamphlet' },
        { id: 'pe-11', label: 'Med Fact Sheets' },
      ],
    },
    {
      feature: 'products',
      featureLabel: FEATURE_LABELS.products,
      items: [
        { id: 'p1', label: 'Tirzepatide' },
        { id: 'p2', label: 'Semaglutide' },
        { id: 'p3', label: 'Semaglutide + L-Carnitine' },
        { id: 'p4', label: 'Tirzepatide + B6' },
        { id: 'p5', label: 'NAD+' },
        { id: 'p6', label: 'Sermorelin' },
        { id: 'p7', label: 'Bremelanotide' },
        { id: 'p8', label: "Lipo-MIC / Myers' Cocktail" },
      ],
    },
  ];
}

export function getAllValidMaterialIds(): Set<string> {
  const s = new Set<string>();
  for (const g of getMaterialCatalog()) {
    for (const it of g.items) s.add(it.id);
  }
  return s;
}
