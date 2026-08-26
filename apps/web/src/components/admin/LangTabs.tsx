import { useTranslation } from 'react-i18next';
import { Copy, Check, Circle } from 'lucide-react';
import clsx from 'clsx';

export type LangSuffix = 'Uz' | 'En' | 'Ru';

export const LANG_TABS: ReadonlyArray<{ key: LangSuffix; label: string }> = [
  { key: 'Uz', label: "O'zbek" },
  { key: 'En', label: 'English' },
  { key: 'Ru', label: 'Русский' },
];

interface Props {
  active: LangSuffix;
  onChange: (lang: LangSuffix) => void;
  /** Har bir yorliq to'ldirilganmi — moderator qaysi til qolganini ko'radi. */
  filled: Record<LangSuffix, boolean>;
  /** O'zbekcha matnni joriy yorliqqa ko'chirish. */
  onCopyFromUz?: () => void;
}

/**
 * Til yorliqlari. O'zbek tili birinchi va sukut bo'yicha ochiq.
 * Uchala til ketma-ket turgan uzun shakl o'rniga (07-topshiriq, 9-bo'lim).
 */
export default function LangTabs({ active, onChange, filled, onCopyFromUz }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 border-b border-gray-200">
      {LANG_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            active === tab.key
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          {tab.label}
          {filled[tab.key] ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" aria-label={t('admin.filled')} />
          ) : (
            <Circle className="h-2 w-2 text-amber-400 fill-amber-400" aria-label={t('admin.empty_tab')} />
          )}
        </button>
      ))}

      {onCopyFromUz && active !== 'Uz' && (
        <button
          type="button"
          onClick={onCopyFromUz}
          className="ml-auto mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:underline"
        >
          <Copy className="h-3.5 w-3.5" />
          {t('admin.copy_from_uz')}
        </button>
      )}
    </div>
  );
}
