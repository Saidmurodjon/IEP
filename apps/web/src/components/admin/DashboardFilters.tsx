import { useTranslation } from 'react-i18next';
import { CalendarRange } from 'lucide-react';
import FieldError from '@/components/FieldError';
import type { StatsRangeParams } from '@/lib/api';

export const PERIOD_PRESETS = ['7d', '30d', '90d', '12m', 'year', 'custom'] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

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

interface DashboardFiltersProps {
  preset: PeriodPreset;
  from: string;
  to: string;
  /** Xato bo'lsa — maydon ostida ko'rsatiladi. */
  error?: string;
  onPreset: (preset: PeriodPreset) => void;
  onCustom: (from: string, to: string) => void;
}

/** Dashboard davr filtri: tayyor davrlar va «Oraliq» uchun shu qatorda ikki sana maydoni. */
export default function DashboardFilters({ preset, from, to, error, onPreset, onCustom }: DashboardFiltersProps) {
  const { t } = useTranslation();
  const tf = (k: string) => t(`admin.dashboardStats.filter.${k}`);

  const today = toDayString(new Date());
  const dateCls = 'input w-auto py-1.5 text-sm';
  const invalid = error ? { 'aria-invalid': true, 'aria-describedby': 'dash-range-error' } : {};

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <CalendarRange className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
        {/* Tayyor davrlar — bitta segmentli guruh */}
        <div
          role="group"
          aria-label={tf('period')}
          className="inline-flex flex-wrap rounded-lg border border-gray-300 p-0.5 dark:border-gray-700"
        >
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPreset(p)}
              aria-pressed={preset === p}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                preset === p
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {tf(`presets.${p}`)}
            </button>
          ))}
        </div>
        {/* «Oraliq» tanlanganda — shu qatorning o'zida ikki sana */}
        {preset === 'custom' && (
          <div className="flex items-center gap-2">
            <label htmlFor="dash-from" className="sr-only">{tf('start')}</label>
            <input
              id="dash-from" type="date" className={dateCls} value={from} max={to || today}
              onChange={(e) => onCustom(e.target.value, to)} {...invalid}
            />
            <span className="text-gray-600 dark:text-gray-300" aria-hidden="true">—</span>
            <label htmlFor="dash-to" className="sr-only">{tf('end')}</label>
            <input
              id="dash-to" type="date" className={dateCls} value={to} min={from || undefined} max={today}
              onChange={(e) => onCustom(from, e.target.value)} {...invalid}
            />
          </div>
        )}
      </div>
      <FieldError id="dash-range-error" message={error} />
    </div>
  );
}
