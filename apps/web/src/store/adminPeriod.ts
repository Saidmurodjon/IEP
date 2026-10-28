import { create } from 'zustand';
import type { StatsRangeParams } from '@/lib/api';

// Admin paneldagi umumiy davr filtri: navbar'dagi filtr ikonkasi o'zgartiradi,
// dashboard grafiklari va navbar qidiruvi o'qiydi.

export const PERIOD_PRESETS = ['7d', '30d', '90d', '12m', 'year', 'custom'] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
/** API standarti (oxirgi 12 oy) — filtr «faol emas» deb hisoblanadi. */
export const DEFAULT_PRESET: PeriodPreset = '12m';

/** Mahalliy sana `YYYY-MM-DD` ko'rinishida (`<input type="date">` shakli). */
export function toDayString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Tayyor davrdan API oralig'i. `12m` — API standarti, parametrsiz yuboriladi. */
export function presetRange(preset: Exclude<PeriodPreset, 'custom'>, now = new Date()): StatsRangeParams {
  const daysBack = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return toDayString(d);
  };
  switch (preset) {
    case '7d': return { from: daysBack(6), to: toDayString(now) };
    case '30d': return { from: daysBack(29), to: toDayString(now) };
    case '90d': return { from: daysBack(89), to: toDayString(now) };
    case 'year': return { from: `${now.getFullYear()}-01-01`, to: toDayString(now) };
    case '12m': return {};
  }
}

interface AdminPeriodState {
  preset: PeriodPreset;
  /** Faqat `custom` uchun. */
  from: string;
  to: string;
  setPreset: (preset: PeriodPreset) => void;
  setCustom: (from: string, to: string) => void;
}

export const useAdminPeriod = create<AdminPeriodState>((set, get) => ({
  preset: DEFAULT_PRESET,
  from: '',
  to: '',
  setPreset: (preset) => {
    if (preset !== 'custom') { set({ preset }); return; }
    // «Oraliq» joriy davrdan boshlanadi — foydalanuvchi faqat kerakli sanani o'zgartiradi.
    const { preset: cur, from, to } = get();
    if (cur === 'custom' && from && to) return;
    const now = new Date();
    const r = cur === 'custom' ? {} : presetRange(cur, now);
    set({
      preset,
      from: r.from ?? toDayString(new Date(now.getFullYear(), now.getMonth() - 11, 1)),
      to: r.to ?? toDayString(now),
    });
  },
  setCustom: (from, to) => set({ preset: 'custom', from, to }),
}));

export type RangeError = 'required' | 'invalid';

/** Joriy davr: API parametrlari va (bo'lsa) «Oraliq» xatosi. Xato bo'lsa — standart oraliq. */
export function useAdminRange(): { range: StatsRangeParams; error?: RangeError; active: boolean } {
  const { preset, from, to } = useAdminPeriod();
  if (preset !== 'custom') return { range: presetRange(preset), active: preset !== DEFAULT_PRESET };
  if (!from || !to) return { range: {}, error: 'required', active: true };
  if (from > to) return { range: {}, error: 'invalid', active: true };
  return { range: { from, to }, active: true };
}
