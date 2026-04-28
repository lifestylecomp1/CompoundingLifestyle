import { Router, Request, Response } from 'express';
import path from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { hasAccessToMaterial, hasFeature } from '../db/index.js';
import { requireFeature, requireAdmin } from '../middleware/requireFeature.js';
import { getFeatureForMaterialId } from '../features.js';
import {
  loadMonographs,
  addMonograph,
  updateMonograph,
} from '../db/monographs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Materials live in server/materials/ (brochures + catalogs/ subfolder)
const materialsPath = path.resolve(process.cwd(), 'materials');
const monographsDir = path.join(materialsPath, 'monographs');

const BROCHURE_FILES: Record<string, string> = {
  'brochure-1': 'GHK-Cu-Brochure.pdf',
  'brochure-2': 'Patient-NAD-Brochure.pdf',
};

const CATALOG_FILES: Record<string, string> = {
  'cat-2': 'catalogs/Spring-2026.pdf',
  'cat-6': 'catalogs/Peptides.pdf',
};

function getMonographFiles(): Record<string, string> {
  const items = loadMonographs();
  const out: Record<string, string> = {};
  for (const m of items) {
    out[m.id] = `monographs/${m.fileName}`;
  }
  return out;
}

const monographPhotosDir = path.join(monographsDir, 'photos');

function monographPhotoAbsPath(photoFileName: string): string {
  return path.join(monographPhotosDir, photoFileName);
}

function safeUnlinkMonographPhoto(photoFileName: string | undefined): void {
  if (!photoFileName) return;
  const p = monographPhotoAbsPath(photoFileName);
  if (existsSync(p)) unlinkSync(p);
}

const DOSING_FILES: Record<string, string> = {
  'dose-1': 'dosing/B6 Tirz Dosing Guide.png',
  'dose-2': 'dosing/SemaglutideL-Carnitine Dosing Final.png',
};

const COA_FILES: Record<string, string> = {
  'coa-1': 'coas/Lifestyle Tirz COA.PDF',
  'coa-2': 'coas/Lifestyle Sema COA.PDF',
  'coa-3': 'coas/Sema_L-carnatine COA.PDF.pdf',
  'coa-4': 'coas/Tirz B6 Validation of Formula.PDF',
  'coa-5': 'coas/Tirzepatide Analysis 06062025.pdf',
};

const PAMPHLET_FILES: Record<string, string> = {
  'pe-1': 'pamphlets/GLP1-GIP-1.png',
  'pe-2': 'pamphlets/Semaglutide-1.png',
  'pe-3': 'pamphlets/Tirzepatide-1.png',
  'pe-4': 'pamphlets/Dulaglutide-1.png',
  'pe-5': 'pamphlets/Male-HRT-1.png',
  'pe-6': 'pamphlets/Female-HRT-1.png',
  'pe-7': 'pamphlets/Sexual-Health-1.png',
  'pe-8': 'pamphlets/B12-LipoMIC-1.png',
  'pe-9': 'pamphlets/MIC-Lipotropic-1.png',
  'pe-10': 'pamphlets/Infusion-1.jpg',
  'pe-11': 'pamphlets/Med-Fact-Sheets-1.pdf',
};

const PRICING_FILES: Record<string, string> = {
  'price-1': 'pricing/Volume Pricing Sheet Spring 2026.pdf',
  'price-2': 'pricing/Product Descriptions - Google Docs.pdf',
  'price-3': 'pricing/Product Blurbs.xlsx',
};

const STATE_LICENSE_FILES: Record<string, string> = {
  'license-ak': 'state-licenses/Alaska.pdf',
  'license-az': 'state-licenses/Arizona.pdf',
  'license-co': 'state-licenses/Colorado.pdf',
  'license-ct': 'state-licenses/Connecticut.png',
  'license-de': 'state-licenses/Delaware.pdf',
  'license-fl': 'state-licenses/Florida.pdf',
  'license-hi': 'state-licenses/Hawaii.pdf',
  'license-id': 'state-licenses/Idaho.png',
  'license-il': 'state-licenses/Illinois.pdf',
  'license-me': 'state-licenses/Maine.pdf',
  'license-nh': 'state-licenses/New-Hampshire.pdf',
  'license-nm': 'state-licenses/New-Mexico.pdf',
  'license-ny': 'state-licenses/New-York.pdf',
  'license-oh': 'state-licenses/Ohio.pdf',
  'license-ri': 'state-licenses/Rhode-Island.pdf',
  'license-ut': 'state-licenses/Utah.png',
  'license-wi': 'state-licenses/Wisconsin.png',
  'license-wy': 'state-licenses/Wyoming.pdf',
};

// Material definitions - mirrors frontend structure; IDs must match for access control
const catalogAndPricing = [
  { id: 'cat-2', title: 'Spring 2026 Catalog', category: 'catalog', fileType: 'PDF', description: 'Current seasonal catalog' },
  { id: 'cat-6', title: 'Peptides', category: 'catalog', fileType: 'PDF', description: 'Peptide catalog' },
  { id: 'price-1', title: 'Volume Pricing Sheet Spring 2026', category: 'pricing', fileType: 'PDF', description: 'Volume pricing' },
  { id: 'price-2', title: 'Product Descriptions', category: 'pricing', fileType: 'PDF', description: 'Product overview' },
  { id: 'price-3', title: 'Product Blurbs', category: 'pricing', fileType: 'Excel', description: 'Product blurbs' },
];

// Monographs are loaded from JSON store (editable)
const dosingGuides = [
  { id: 'dose-1', title: 'B6 Tirz Dosing Guide', category: 'dosing', fileType: 'PNG' },
  { id: 'dose-2', title: 'Semaglutide L-Carnitine Dosing', category: 'dosing', fileType: 'PNG' },
];

const coas = [
  { id: 'coa-1', title: 'Tirzepatide COA', category: 'coas', fileType: 'PDF' },
  { id: 'coa-2', title: 'Semaglutide COA', category: 'coas', fileType: 'PDF' },
  { id: 'coa-3', title: 'Sema L-Carnitine COA', category: 'coas', fileType: 'PDF' },
  { id: 'coa-4', title: 'Tirz B6 Validation', category: 'coas', fileType: 'PDF' },
  { id: 'coa-5', title: 'Tirzepatide Analysis', category: 'coas', fileType: 'PDF' },
];

const stateLicenses = [
  { id: 'license-ak', title: 'Alaska', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-az', title: 'Arizona', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-co', title: 'Colorado', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ct', title: 'Connecticut', category: 'state-licenses', fileType: 'PNG', description: 'Board verification' },
  { id: 'license-de', title: 'Delaware', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-fl', title: 'Florida', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-hi', title: 'Hawaii', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-id', title: 'Idaho', category: 'state-licenses', fileType: 'PNG', description: 'Board verification' },
  { id: 'license-il', title: 'Illinois', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-me', title: 'Maine', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-nh', title: 'New Hampshire', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-nm', title: 'New Mexico', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ny', title: 'New York', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-oh', title: 'Ohio', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ri', title: 'Rhode Island', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
  { id: 'license-ut', title: 'Utah', category: 'state-licenses', fileType: 'PNG', description: 'Board verification' },
  { id: 'license-wi', title: 'Wisconsin', category: 'state-licenses', fileType: 'PNG', description: 'Board verification' },
  { id: 'license-wy', title: 'Wyoming', category: 'state-licenses', fileType: 'PDF', description: 'Board verification' },
];

const patientBrochures = [
  { id: 'brochure-1', title: 'GHK-Cu Brochure', description: 'Copper peptide topical cream - patient overview', filePath: '/api/materials/file/brochure-1' },
  { id: 'brochure-2', title: 'Patient NAD Brochure', description: 'NAD+ cellular energy & anti-aging - patient overview', filePath: '/api/materials/file/brochure-2' },
];

const patientEducationCategories = [
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

const productQuickRef = [
  { id: 'p1', name: 'Tirzepatide', category: 'GLP-1/GIP', description: 'Dual agonist for weight management and glycemic control', sizes: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'], notes: 'See dosing guide for escalation' },
  { id: 'p2', name: 'Semaglutide', category: 'GLP-1', description: 'GLP-1 agonist for weight loss and diabetes', sizes: ['0.25mg', '0.5mg', '1mg', '2.4mg'], notes: 'Weekly injection' },
  { id: 'p3', name: 'Semaglutide + L-Carnitine', category: 'GLP-1 + Amino Acid', description: 'Combination for enhanced metabolic support', sizes: ['5mL', '10mL'], notes: 'See dosing guide' },
  { id: 'p4', name: 'Tirzepatide + B6', category: 'GLP-1/GIP + Vitamin', description: 'Tirzepatide with B6 for reduced nausea', sizes: ['As per Tirzepatide'], notes: 'Validation available' },
  { id: 'p5', name: 'NAD+', category: 'Peptide', description: 'Cellular energy, anti-aging, recovery', sizes: ['IV/IM formulations'], notes: 'See monograph' },
  { id: 'p6', name: 'Sermorelin', category: 'Peptide', description: 'Growth hormone support', sizes: ['Standard vial sizes'], notes: 'See monograph' },
  { id: 'p7', name: 'Bremelanotide', category: 'Peptide', description: 'Sexual health support', sizes: ['As prescribed'], notes: 'See monograph' },
  { id: 'p8', name: "Lipo-MIC / Myers' Cocktail", category: 'Injectables / Infusions', description: 'Lipotropic and IV nutrient formulations', sizes: ['Various'], notes: 'See dosing and monographs' },
];

function filterByAccess<T extends { id: string }>(items: T[], partnerId: string): T[] {
  return items.filter((item) => hasAccessToMaterial(partnerId, item.id));
}

const router = Router();

type ReqFiles = Record<string, Express.Multer.File[] | undefined>;
function getUploadedFile(files: ReqFiles | undefined, field: string): Express.Multer.File | undefined {
  return files?.[field]?.[0];
}

function truthyRemovePhoto(body: Record<string, unknown>): boolean {
  const v = body.removePhoto;
  return v === true || v === 'true' || v === '1' || v === 'on';
}

// Multer: monograph document (PDF/DOCX) + optional cover photo (images)
const monographStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPhoto = file.fieldname === 'photo';
    const dir = isPhoto ? monographPhotosDir : monographsDir;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safe =
      Buffer.from(file.originalname, 'latin1')
        .toString('utf-8')
        .replace(/[^\w\s.-]/g, '')
        .replace(/\s+/g, '_')
        .trim() || (file.fieldname === 'photo' ? 'cover' : 'monograph');
    const ext = path.extname(file.originalname) || (file.fieldname === 'photo' ? '.jpg' : '.pdf');
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const prefix = file.fieldname === 'photo' ? 'cover_' : '';
    cb(null, `${prefix}${stamp}_${safe}${ext}`);
  },
});
const uploadMonograph = multer({
  storage: monographStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    if (file.fieldname === 'photo') {
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) cb(null, true);
      else cb(new Error('Cover photo must be JPG, PNG, GIF, or WebP'));
    } else if (file.fieldname === 'file') {
      if (['.pdf', '.docx'].includes(ext)) cb(null, true);
      else cb(new Error('Only PDF and DOCX files are allowed for the document'));
    } else cb(new Error('Unexpected field'));
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

router.get('/catalog-and-pricing', requireAuth, requireFeature('catalog_pricing'), (req: Request, res: Response) => {
  const filtered = filterByAccess(catalogAndPricing, req.partnerId!);
  res.json({ catalogAndPricing: filtered });
});

router.get('/monographs', requireAuth, requireFeature('clinical_education'), (req: Request, res: Response) => {
  const monographs = loadMonographs();
  const filtered = filterByAccess(monographs, req.partnerId!);
  res.json({ monographs: filtered });
});

router.post('/monographs', requireAuth, requireAdmin, uploadMonograph, (req: Request, res: Response) => {
  try {
    const files = (req as Request & { files?: ReqFiles }).files;
    const docFile = getUploadedFile(files, 'file');
    const photoFile = getUploadedFile(files, 'photo');
    const name = (req.body.name as string)?.trim();
    const description = (req.body.description as string)?.trim() || '';
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!docFile) return res.status(400).json({ error: 'Document file is required' });
    const monograph = addMonograph(name, description, docFile.filename, photoFile?.filename);
    res.status(201).json(monograph);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    res.status(400).json({ error: msg });
  }
});

router.put('/monographs/:id', requireAuth, requireAdmin, uploadMonograph, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = loadMonographs().find((m) => m.id === id);
    if (!existing) return res.status(404).json({ error: 'Monograph not found' });

    const files = (req as Request & { files?: ReqFiles }).files;
    const docFile = getUploadedFile(files, 'file');
    const photoFile = getUploadedFile(files, 'photo');
    const name = (req.body.name as string)?.trim();
    const description = (req.body.description as string)?.trim();
    const removePhoto = truthyRemovePhoto(req.body as Record<string, unknown>);

    const updates: {
      name?: string;
      description?: string;
      fileName?: string;
      photoFileName?: string | null;
    } = {};
    if (name !== undefined && name !== '') updates.name = name;
    if (description !== undefined) updates.description = description;
    if (docFile) updates.fileName = docFile.filename;
    if (photoFile) {
      updates.photoFileName = photoFile.filename;
      safeUnlinkMonographPhoto(existing.photoFileName);
    } else if (removePhoto) {
      updates.photoFileName = null;
      safeUnlinkMonographPhoto(existing.photoFileName);
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });
    const monograph = updateMonograph(id, updates);
    if (!monograph) return res.status(404).json({ error: 'Monograph not found' });
    res.json(monograph);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    res.status(400).json({ error: msg });
  }
});

router.get('/monograph-photo/:id', requireAuth, requireFeature('clinical_education'), (req: Request, res: Response) => {
  const monographs = loadMonographs();
  const m = monographs.find((x) => x.id === req.params.id);
  if (!m?.photoFileName) return res.status(404).json({ error: 'No photo' });
  if (!hasAccessToMaterial(req.partnerId!, m.id)) return res.status(403).json({ error: 'Access denied' });
  const abs = monographPhotoAbsPath(m.photoFileName);
  if (!existsSync(abs)) return res.status(404).json({ error: 'Photo file missing' });
  res.sendFile(abs);
});

router.get('/dosing', requireAuth, requireFeature('dosing'), (req: Request, res: Response) => {
  const filtered = filterByAccess(dosingGuides, req.partnerId!);
  res.json({ dosingGuides: filtered });
});

router.get('/coas', requireAuth, requireFeature('coas'), (req: Request, res: Response) => {
  const filtered = filterByAccess(coas, req.partnerId!);
  res.json({ coas: filtered });
});

router.get('/state-licenses', requireAuth, requireFeature('state_licenses'), (req: Request, res: Response) => {
  const filtered = filterByAccess(stateLicenses, req.partnerId!);
  res.json({ stateLicenses: filtered });
});

router.get('/patient-brochures', requireAuth, requireFeature('patient_education'), (req: Request, res: Response) => {
  const filtered = filterByAccess(patientBrochures, req.partnerId!);
  res.json({ patientBrochures: filtered });
});

// Serve all materials (Authorization: Bearer; optional ?token= only if ALLOW_AUTH_QUERY_TOKEN=true)
router.get('/file/:id', requireAuth, (req: Request, res: Response) => {
  const feat = getFeatureForMaterialId(req.params.id);
  if (feat && !hasFeature(req.partnerId!, feat)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const monographFiles = getMonographFiles();
  const filename =
    BROCHURE_FILES[req.params.id] ??
    CATALOG_FILES[req.params.id] ??
    monographFiles[req.params.id] ??
    DOSING_FILES[req.params.id] ??
    COA_FILES[req.params.id] ??
    PAMPHLET_FILES[req.params.id] ??
    PRICING_FILES[req.params.id] ??
    STATE_LICENSE_FILES[req.params.id];
  if (!filename) return res.status(404).json({ error: 'File not found' });
  if (!hasAccessToMaterial(req.partnerId!, req.params.id)) return res.status(403).json({ error: 'Access denied' });
  res.sendFile(path.join(materialsPath, filename));
});

router.get('/patient-education', requireAuth, requireFeature('patient_education'), (req: Request, res: Response) => {
  const filtered = filterByAccess(patientEducationCategories, req.partnerId!);
  res.json({ patientEducationCategories: filtered });
});

router.get('/products', requireAuth, requireFeature('products'), (req: Request, res: Response) => {
  const filtered = filterByAccess(productQuickRef, req.partnerId!);
  res.json({ productQuickRef: filtered });
});

// All materials in one response for dashboard
router.get('/all', requireAuth, (req: Request, res: Response) => {
  const partnerId = req.partnerId!;
  const monographs = loadMonographs();
  res.json({
    catalogAndPricing: hasFeature(partnerId, 'catalog_pricing')
      ? filterByAccess(catalogAndPricing, partnerId)
      : [],
    monographs: hasFeature(partnerId, 'clinical_education')
      ? filterByAccess(monographs, partnerId)
      : [],
    dosingGuides: hasFeature(partnerId, 'dosing') ? filterByAccess(dosingGuides, partnerId) : [],
    coas: hasFeature(partnerId, 'coas') ? filterByAccess(coas, partnerId) : [],
    patientBrochures: hasFeature(partnerId, 'patient_education')
      ? filterByAccess(patientBrochures, partnerId)
      : [],
    patientEducationCategories: hasFeature(partnerId, 'patient_education')
      ? filterByAccess(patientEducationCategories, partnerId)
      : [],
    productQuickRef: hasFeature(partnerId, 'products') ? filterByAccess(productQuickRef, partnerId) : [],
    stateLicenses: hasFeature(partnerId, 'state_licenses')
      ? filterByAccess(stateLicenses, partnerId)
      : [],
  });
});

export default router;
