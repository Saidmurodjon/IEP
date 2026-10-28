import { Atom, Zap, Leaf, ShieldCheck, Users, Award, Globe, Lightbulb, type LucideIcon } from 'lucide-react';
import type { AboutContent, AboutValueIcon, Lang, Translation } from '@energetika/shared';

/** `GET /api/about` javobi. */
export interface AboutResponse {
  data: AboutContent;
  live: { labs: number; employees: number; publications: number };
}

export const VALUE_ICON_MAP: Record<AboutValueIcon, LucideIcon> = {
  atom: Atom,
  zap: Zap,
  leaf: Leaf,
  shield: ShieldCheck,
  users: Users,
  award: Award,
  globe: Globe,
  lightbulb: Lightbulb,
};

/** Tanlangan tildagi matn; tarjima bo'lmasa o'zbekchasi (soxta matn emas). */
export function pick(tr: Translation | undefined, lang: Lang): string {
  if (!tr) return '';
  return (tr[lang] || tr.uz || '').trim();
}

/** Bo'sh qator bilan ajratilgan matnni xatboshilarga bo'ladi. */
export function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export const emptyTranslation = (): Translation => ({ uz: '', en: '', ru: '' });
