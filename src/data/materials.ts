// Mock material data - maps to your actual content structure

export type MaterialCategory = 
  | 'catalog' 
  | 'pricing'
  | 'monographs' 
  | 'dosing' 
  | 'coas' 
  | 'patient-education'
  | 'state-licenses';

export interface Material {
  id: string;
  title: string;
  description?: string;
  category: MaterialCategory;
  fileType: string;
  season?: string; // for catalogs
}

export interface Monograph {
  id: string;
  name: string;
  description: string;
  fileName: string;
  photoFileName?: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  sizes: string[];
  notes?: string;
}

// Catalog & Pricing - one current catalog + Peptides + pricing materials (merged)
export const catalogAndPricing = [
  { id: 'cat-2', title: 'Spring 2026 Catalog', category: 'catalog' as const, fileType: 'PDF', description: 'Current seasonal catalog' },
  { id: 'cat-6', title: 'Peptides', category: 'catalog' as const, fileType: 'PDF', description: 'Peptide catalog' },
  { id: 'price-1', title: 'Volume Pricing Sheet Spring 2026', category: 'pricing' as const, fileType: 'PDF', description: 'Volume pricing' },
  { id: 'price-2', title: 'Product Descriptions', category: 'pricing' as const, fileType: 'PDF', description: 'Product overview' },
  { id: 'price-3', title: 'Product Blurbs', category: 'pricing' as const, fileType: 'Excel', description: 'Product blurbs' },
];

// Monographs — synced with server/data/monographs.json (API is source of truth at runtime)
export const monographs: Monograph[] = [
  { id: 'mon-1', name: 'Bremelanotide', description: 'Peptide for sexual health support', fileName: 'Bremelanotide.pdf' },
  { id: 'mon-2', name: 'GHK-Cu Topical Cream', description: 'Copper peptide topical cream', fileName: 'GHK-CU Topical Cream (1).pdf' },
  { id: 'mon-3', name: 'Glutathione', description: 'Antioxidant, detox support', fileName: 'Glutathione Monograph.pdf' },
  { id: 'mon-4', name: 'Lipo-MIC', description: 'Lipotropic injection formulation', fileName: 'Lipo-MICCC.pdf' },
  { id: 'mon-5', name: 'Myers\' Cocktail', description: 'IV nutrient formulation', fileName: 'Myers_ Cocktail.pdf' },
  { id: 'mon-6', name: 'NAD+', description: 'Cellular energy, anti-aging', fileName: 'NAD+.pdf' },
  { id: 'mon-7', name: 'Sermorelin', description: 'Growth hormone releasing hormone analog', fileName: 'Sermorelin.pdf' },
  {
    id: 'mon-8',
    name: 'Glutamine, Arginine & L-Carnitine',
    description: 'Amino acid support — key benefits & uses',
    fileName: 'Glutamine, Arginine, & L-Carnitine_ Key Benefits & Uses.docx',
  },
];

// Dosing guides
export const dosingGuides = [
  { id: 'dose-1', title: 'B6 Tirz Dosing Guide', category: 'dosing' as const, fileType: 'PNG' },
  { id: 'dose-2', title: 'Semaglutide L-Carnitine Dosing', category: 'dosing' as const, fileType: 'PNG' },
];

// Certificates of Analysis
export const coas = [
  { id: 'coa-1', title: 'Tirzepatide COA', category: 'coas' as const, fileType: 'PDF' },
  { id: 'coa-2', title: 'Semaglutide COA', category: 'coas' as const, fileType: 'PDF' },
  { id: 'coa-3', title: 'Sema L-Carnitine COA', category: 'coas' as const, fileType: 'PDF' },
  { id: 'coa-4', title: 'Tirz B6 Validation', category: 'coas' as const, fileType: 'PDF' },
  { id: 'coa-5', title: 'Tirzepatide Analysis', category: 'coas' as const, fileType: 'PDF' },
];

// State pharmacy / outlet license verifications (PDFs under server/materials/state-licenses/)
export const stateLicenses = [
  { id: 'license-ak', title: 'Alaska', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-az', title: 'Arizona', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-co', title: 'Colorado', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ct', title: 'Connecticut', category: 'state-licenses' as const, fileType: 'PNG', description: 'Board verification' },
  { id: 'license-de', title: 'Delaware', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-fl', title: 'Florida', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-hi', title: 'Hawaii', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-id', title: 'Idaho', category: 'state-licenses' as const, fileType: 'PNG', description: 'Board verification' },
  { id: 'license-il', title: 'Illinois', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-me', title: 'Maine', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-nh', title: 'New Hampshire', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-nm', title: 'New Mexico', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ny', title: 'New York', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-oh', title: 'Ohio', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ri', title: 'Rhode Island', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ut', title: 'Utah', category: 'state-licenses' as const, fileType: 'PNG', description: 'Board verification' },
  { id: 'license-wi', title: 'Wisconsin', category: 'state-licenses' as const, fileType: 'PNG', description: 'Board verification' },
  { id: 'license-wy', title: 'Wyoming', category: 'state-licenses' as const, fileType: 'PDF', description: 'Board verification' },
];

// Patient brochures - standalone PDFs for reps to view/share with customers
export const patientBrochures = [
  { id: 'brochure-1', title: 'GHK-Cu Brochure', description: 'Copper peptide topical cream - patient overview', filePath: '/materials/GHK-Cu-Brochure.pdf' },
  { id: 'brochure-2', title: 'Patient NAD Brochure', description: 'NAD+ cellular energy & anti-aging - patient overview', filePath: '/materials/Patient-NAD-Brochure.pdf' },
];

// Patient education categories
export const patientEducationCategories = [
  { id: 'pe-1', name: 'GLP-1 / GIP Differences', folder: 'GLP1-GIP Differences' },
  { id: 'pe-2', name: 'Semaglutide', folder: 'Semaglutide' },
  { id: 'pe-3', name: 'Tirzepatide', folder: 'Tirzepatide' },
  { id: 'pe-4', name: 'Dulaglutide', folder: 'Dulaglutide' },
  { id: 'pe-5', name: 'Male HRT', folder: 'Male HRT' },
  { id: 'pe-6', name: 'Female HRT', folder: 'Female HRT' },
  { id: 'pe-7', name: 'Sexual Health', folder: 'Sexual Health' },
  { id: 'pe-8', name: 'B12 Shots vs Lipo-MIC', folder: 'B12 Shots vs. Lipo-MIC-B12_Shots' },
  { id: 'pe-9', name: 'MIC Lipotropic Injections', folder: 'MIC Lipotropic Injections' },
  { id: 'pe-10', name: 'Infusion Pamphlet', folder: 'Infusion Pamphlet' },
  { id: 'pe-11', name: 'Med Fact Sheets', folder: 'Med Fact Sheets' },
];

// Product quick reference - for reps to quickly look up drug, sizes, pricing
export const productQuickRef: ProductInfo[] = [
  { id: 'p1', name: 'Tirzepatide', category: 'GLP-1/GIP', description: 'Dual agonist for weight management and glycemic control', sizes: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'], notes: 'See dosing guide for escalation' },
  { id: 'p2', name: 'Semaglutide', category: 'GLP-1', description: 'GLP-1 agonist for weight loss and diabetes', sizes: ['0.25mg', '0.5mg', '1mg', '2.4mg'], notes: 'Weekly injection' },
  { id: 'p3', name: 'Semaglutide + L-Carnitine', category: 'GLP-1 + Amino Acid', description: 'Combination for enhanced metabolic support', sizes: ['5mL', '10mL'], notes: 'See dosing guide' },
  { id: 'p4', name: 'Tirzepatide + B6', category: 'GLP-1/GIP + Vitamin', description: 'Tirzepatide with B6 for reduced nausea', sizes: ['As per Tirzepatide'], notes: 'Validation available' },
  { id: 'p5', name: 'NAD+', category: 'Peptide', description: 'Cellular energy, anti-aging, recovery', sizes: ['IV/IM formulations'], notes: 'See monograph' },
  { id: 'p6', name: 'Sermorelin', category: 'Peptide', description: 'Growth hormone support', sizes: ['Standard vial sizes'], notes: 'See monograph' },
  { id: 'p7', name: 'Bremelanotide', category: 'Peptide', description: 'Sexual health support', sizes: ['As prescribed'], notes: 'See monograph' },
  { id: 'p8', name: 'Lipo-MIC / Myers\' Cocktail', category: 'Injectables / Infusions', description: 'Lipotropic and IV nutrient formulations', sizes: ['Various'], notes: 'See dosing and monographs' },
];
