import type { Lang } from '@energetika/shared';

/** `/api/structure` qaytaradigan birlik. */
export interface Unit {
  id: string;
  nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  /** To'liq ma'lumot (HTML) — ko'rsatishdan oldin `sanitize` dan o'tkaziladi. */
  contentUz?: string; contentEn?: string; contentRu?: string;
  /** Ilmiy yo'nalishlar, har bir qatorda bittasi. */
  directionsUz?: string; directionsEn?: string; directionsRu?: string;
  imageUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  room?: string | null;
  foundedYear?: number | null;
  order?: number;
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

