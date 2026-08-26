import type { Lang } from '@energetika/shared';

/** `/api/employees` qaytaradigan xodim yozuvi. */
export interface Employee {
  id: string;
  fullNameUz: string; fullNameEn: string; fullNameRu: string;
  positionUz: string; positionEn: string; positionRu: string;
  degreeUz?: string | null; degreeEn?: string | null; degreeRu?: string | null;
  titleUz?: string | null; titleEn?: string | null; titleRu?: string | null;
  email?: string | null;
  /** FAQAT xizmat telefoni — shaxsiy raqam saytda e'lon qilinmaydi. */
  phone?: string | null;
  photoUrl?: string | null;
  orcid?: string | null;
  scopusId?: string | null;
  researchAreaUz?: string | null; researchAreaEn?: string | null; researchAreaRu?: string | null;
  officeRoom?: string | null;
  receptionHoursUz?: string | null; receptionHoursEn?: string | null; receptionHoursRu?: string | null;
  isManagement: boolean;
  isUnitHead: boolean;
  unitId?: string | null;
  order: number;
  isActive: boolean;
}

/**
 * Uch tilli maydonni tanlangan tilda qaytaradi: `field('fullName')` →
 * `fullNameRu`. Tarjima bo'sh bo'lsa o'zbekchasi, u ham bo'sh bo'lsa bo'sh satr.
 */
export function localized(
  record: Record<string, unknown>,
  base: string,
  lang: Lang
): string {
  const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
  const value = record[`${base}${suffix}`];
  if (typeof value === 'string' && value.trim()) return value.trim();
  const fallback = record[`${base}Uz`];
  return typeof fallback === 'string' ? fallback.trim() : '';
}

/**
 * Rasm bo'lmaganda ko'rsatiladigan bosh harflar. Ism-familiyaning
 * dastlabki ikki so'zidan olinadi.
 */
export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** ORCID to'liq havolasi. Faqat identifikator saqlanadi. */
export function orcidUrl(orcid: string): string {
  return orcid.startsWith('http') ? orcid : `https://orcid.org/${orcid}`;
}

/** Scopus muallif profili havolasi. */
export function scopusUrl(scopusId: string): string {
  return scopusId.startsWith('http')
    ? scopusId
    : `https://www.scopus.com/authid/detail.uri?authorId=${scopusId}`;
}
