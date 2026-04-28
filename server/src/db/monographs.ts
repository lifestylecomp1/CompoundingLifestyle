import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monographsPath = join(process.cwd(), 'data', 'monographs.json');

export interface MonographRecord {
  id: string;
  name: string;
  description: string;
  fileName: string;
  /** Stored under materials/monographs/photos/ */
  photoFileName?: string;
}

const DEFAULT_MONOGRAPHS: MonographRecord[] = [
  { id: 'mon-1', name: 'Bremelanotide', description: 'Peptide for sexual health support', fileName: 'Bremelanotide.pdf' },
  { id: 'mon-2', name: 'GHK-Cu Topical Cream', description: 'Copper peptide topical cream', fileName: 'GHK-CU Topical Cream (1).pdf' },
  { id: 'mon-3', name: 'Glutathione', description: 'Antioxidant, detox support', fileName: 'Glutathione Monograph.pdf' },
  { id: 'mon-4', name: 'Lipo-MIC', description: 'Lipotropic injection formulation', fileName: 'Lipo-MICCC.pdf' },
  { id: 'mon-5', name: "Myers' Cocktail", description: 'IV nutrient formulation', fileName: 'Myers_ Cocktail.pdf' },
  { id: 'mon-6', name: 'NAD+', description: 'Cellular energy, anti-aging', fileName: 'NAD+.pdf' },
  { id: 'mon-7', name: 'Sermorelin', description: 'Growth hormone releasing hormone analog', fileName: 'Sermorelin.pdf' },
  {
    id: 'mon-8',
    name: 'Glutamine, Arginine & L-Carnitine',
    description: 'Amino acid support — key benefits & uses',
    fileName: 'Glutamine, Arginine, & L-Carnitine_ Key Benefits & Uses.docx',
  },
];

function ensureDir() {
  const dir = dirname(monographsPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadMonographs(): MonographRecord[] {
  ensureDir();
  if (!existsSync(monographsPath)) {
    return [...DEFAULT_MONOGRAPHS];
  }
  try {
    const raw = readFileSync(monographsPath, 'utf-8');
    const data = JSON.parse(raw) as MonographRecord[];
    return Array.isArray(data) ? data : [...DEFAULT_MONOGRAPHS];
  } catch {
    return [...DEFAULT_MONOGRAPHS];
  }
}

function saveMonographs(items: MonographRecord[]) {
  ensureDir();
  writeFileSync(monographsPath, JSON.stringify(items, null, 2), 'utf-8');
}

function nextId(items: MonographRecord[]): string {
  const nums = items
    .map((m) => {
      const match = m.id.match(/^mon-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 7;
  return `mon-${max + 1}`;
}

export function addMonograph(
  name: string,
  description: string,
  fileName: string,
  photoFileName?: string,
): MonographRecord {
  const items = loadMonographs();
  const id = nextId(items);
  const monograph: MonographRecord = { id, name, description, fileName };
  if (photoFileName) monograph.photoFileName = photoFileName;
  items.push(monograph);
  saveMonographs(items);
  return monograph;
}

export function updateMonograph(
  id: string,
  updates: {
    name?: string;
    description?: string;
    fileName?: string;
    photoFileName?: string | null;
  },
): MonographRecord | null {
  const items = loadMonographs();
  const idx = items.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  if (updates.name !== undefined) items[idx].name = updates.name;
  if (updates.description !== undefined) items[idx].description = updates.description;
  if (updates.fileName !== undefined) items[idx].fileName = updates.fileName;
  if (updates.photoFileName === null) delete items[idx].photoFileName;
  else if (updates.photoFileName !== undefined) items[idx].photoFileName = updates.photoFileName;
  saveMonographs(items);
  return items[idx];
}

export function deleteMonograph(id: string): boolean {
  const items = loadMonographs().filter((m) => m.id !== id);
  if (items.length === loadMonographs().length) return false;
  saveMonographs(items);
  return true;
}
