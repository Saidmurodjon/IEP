import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Accessibility, X, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { FONT_SIZES } from '@/lib/a11y';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Bitta sozlama uchun tugmalar qatori.
 *
 * Generik parametr QIYMAT turi bo'yicha (kalit bo'yicha emas) — shunda
 * `value` va `options` bir-biriga mos ekani tekshiriladi.
 */
function OptionRow<V extends string>({
  label, value, options, onSelect,
}: {
  label: string;
  value: V;
  options: { key: V; label: string }[];
  onSelect: (next: V) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2" id={`a11y-${label}`}>{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`a11y-${label}`}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            aria-pressed={value === option.key}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              value === option.key
                ? 'bg-primary-700 text-white border-primary-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Ko'rinish sozlamalari oynasi (373-son qaror, 11-band).
 *
 * `Escape` bilan yopiladi, ochiq turganda fokus oynadan chiqmaydi
 * (`useFocusTrap`), yopilganda fokus ochgan tugmaga qaytadi.
 */
export default function AccessibilityPanel({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { settings, set, reset, changed } = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return (
    <>
      {/* Fon — bosilganda yopiladi. Klaviatura uchun alohida yo'l bor (Escape). */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-panel-title"
        tabIndex={-1}
        className="fixed right-0 top-0 bottom-0 w-[min(22rem,100vw)] bg-white shadow-xl z-50 overflow-y-auto p-5 focus:outline-none"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 id="a11y-panel-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary-700" aria-hidden="true" />
            {t('a11y.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">{t('a11y.intro')}</p>

        <div className="space-y-6">
          <OptionRow
            label={t('a11y.font_size')}
            value={settings.fontSize}
            options={FONT_SIZES.map((size) => ({ key: size, label: t(`a11y.font_${size}`) }))}
            onSelect={(next) => set('fontSize', next)}
          />

          <OptionRow
            label={t('a11y.contrast')}
            value={settings.contrast}
            options={[
              { key: 'normal', label: t('a11y.contrast_normal') },
              { key: 'high', label: t('a11y.contrast_high') },
            ]}
            onSelect={(next) => set('contrast', next)}
          />

          <OptionRow
            label={t('a11y.images')}
            value={settings.images}
            options={[
              { key: 'on', label: t('a11y.images_on') },
              { key: 'off', label: t('a11y.images_off') },
            ]}
            onSelect={(next) => set('images', next)}
          />

          <OptionRow
            label={t('a11y.spacing')}
            value={settings.spacing}
            options={[
              { key: 'normal', label: t('a11y.spacing_normal') },
              { key: 'wide', label: t('a11y.spacing_wide') },
            ]}
            onSelect={(next) => set('spacing', next)}
          />
        </div>

        <button
          type="button"
          onClick={reset}
          disabled={!changed}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('a11y.reset')}
        </button>

        {/* O'zgarish ekran o'qigichga e'lon qilinadi */}
        <p className="sr-only" aria-live="polite">
          {changed ? t('a11y.applied') : t('a11y.default_view')}
        </p>
      </div>
    </>
  );
}
