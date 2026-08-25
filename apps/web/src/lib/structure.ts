import type { Lang } from '@energetika/shared';

/** `/api/structure` qaytaradigan birlik. */
export interface Unit {
  id: string;
  nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  head?: string | null;
  type: string;
  staffCount?: number | null;
  isAdvisory?: boolean;
  children?: Unit[];
}

/** Daraxtdan barcha ilmiy laboratoriyalarni tekis ro'yxat qilib qaytaradi. */
export function flattenLabs(units: Unit[]): Unit[] {
  const labs: Unit[] = [];
  for (const unit of units) {
    if (unit.type === 'laboratory') labs.push(unit);
    if (unit.children) labs.push(...flattenLabs(unit.children));
  }
  return labs;
}

/** Tanlangan tildagi nom; tarjima bo'lmasa o'zbekchasi. */
export function unitName(unit: Unit, lang: Lang): string {
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit;
  return (unit[key] as string) || unit.nameUz;
}

/**
 * FA Prezidiumining 2025-yil 27-fevraldagi 12-son qarori (10-ilova) bo'yicha shtat.
 * Bosh sahifa va "Institut haqida" sahifasi bir xil raqamni ko'rsatishi uchun
 * shu yerda bitta joyda saqlanadi.
 */
export const INSTITUTE_STAFF = { labs: 6, scientists: 18, total: 29 } as const;
