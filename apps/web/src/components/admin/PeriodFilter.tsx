import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, SlidersHorizontal } from 'lucide-react';
import FieldError from '@/components/FieldError';
import { PERIOD_PRESETS, toDayString, useAdminPeriod, useAdminRange } from '@/store/adminPeriod';

/**
 * Navbar'dagi davr filtri: ikonka bosilganda tayyor davrlar ro'yxati va
 * «Oraliq» uchun ikki sana. Dashboard grafiklari va qidiruvga qo'llanadi.
 */
export default function PeriodFilter() {
  const { t } = useTranslation();
  const tf = (k: string) => t(`admin.dashboardStats.filter.${k}`);
  const { preset, from, to, setPreset, setCustom } = useAdminPeriod();
  const { error, active } = useAdminRange();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const today = toDayString(new Date());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const label = `${tf('period')}: ${tf(`presets.${preset}`)}`;
  const invalid = error ? { 'aria-invalid': true, 'aria-describedby': 'period-error' } : {};
  const dateCls = 'input flex-1 py-1.5 text-sm';

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls="period-panel"
        className={`relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        {/* Standartdan farqli davr tanlanganini bildiradi (rangdan tashqari belgi). */}
        {active && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-600 ring-2 ring-white dark:ring-gray-900" aria-hidden="true" />}
      </button>

      {open && (
        <div
          id="period-panel"
          className="absolute left-0 z-40 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            {tf('period')}
          </p>
          <div role="group" aria-label={tf('period')}>
            {PERIOD_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={preset === p}
                onClick={() => {
                  setPreset(p);
                  // Tayyor davr tanlansa oyna yopiladi, «Oraliq»da sanalar kiritiladi.
                  if (p !== 'custom') setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                  preset === p
                    ? 'bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {tf(`presets.${p}`)}
                {preset === p && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="mt-2 border-t border-gray-100 px-2 pt-3 dark:border-gray-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="period-from" className="w-12 text-xs text-gray-700 dark:text-gray-300">{tf('start')}</label>
                  <input
                    id="period-from" type="date" className={dateCls} value={from} max={to || today}
                    onChange={(e) => setCustom(e.target.value, to)} {...invalid}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="period-to" className="w-12 text-xs text-gray-700 dark:text-gray-300">{tf('end')}</label>
                  <input
                    id="period-to" type="date" className={dateCls} value={to} min={from || undefined} max={today}
                    onChange={(e) => setCustom(from, e.target.value)} {...invalid}
                  />
                </div>
              </div>
              <FieldError id="period-error" message={error ? tf(error) : undefined} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
