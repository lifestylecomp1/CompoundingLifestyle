import type { AdminPartnerRow, MaterialCatalogGroup } from './api';
import { ALL_FEATURES } from './features';

export function effectiveFeatureKeys(row: AdminPartnerRow): string[] {
  if (row.role === 'admin' || row.allowed_features === null) {
    return [...ALL_FEATURES];
  }
  return row.allowed_features;
}

export function allMaterialIdsForRow(
  row: AdminPartnerRow,
  catalog: MaterialCatalogGroup[],
): string[] {
  const feats = new Set(effectiveFeatureKeys(row));
  const out: string[] = [];
  for (const g of catalog) {
    if (feats.has(g.feature)) {
      g.items.forEach((i) => out.push(i.id));
    }
  }
  return out;
}

export function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}
