import { useEffect, useId, useRef, type FormEventHandler, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type Size = 'sm' | 'md';

const SIZE_CLASS: Record<Size, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
};

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: Size;
  onClose: () => void;
  /** Berilsa — tana va pastki panel bitta `<form>` ichida bo'ladi. */
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** Pastki panel (tugmalar). Tana aylansa ham doim ko'rinib turadi. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Admin paneldagi kichik oynalar (tasdiqlash, parolni tiklash) qobig'i.
 * Kattaroq qo'shish/tahrirlash shakllari oyna emas — `AdminFormPage`.
 *
 * Sarlavha va tugmalar paneli qotirilgan, faqat tana aylanadi — uzun shaklda
 * ham «Saqlash» doim ko'z oldida. Fokus oyna ichida qamaladi, `Escape` yopadi
 * (CLAUDE.md 21-qoida). Telefonda butun ekranni egallaydi.
 */
export default function AdminFormModal({
  title, subtitle, icon: Icon, size = 'sm', onClose, onSubmit, footer, children,
}: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(ref, true, onClose);

  // Oyna ochiq turganda orqadagi sahifa aylanmasin.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const body = (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 sm:px-8 space-y-5">
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4 sm:px-8 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          'relative flex flex-col w-full max-h-[100dvh] sm:max-h-[calc(100dvh-3rem)] overflow-hidden',
          'bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl',
          'ring-1 ring-black/5 dark:ring-white/10 motion-safe:animate-modal-in',
          SIZE_CLASS[size]
        )}
      >
        <div aria-hidden="true" className="h-1 shrink-0 bg-gradient-to-r from-primary-700 via-primary-400 to-accent-400" />

        <div className="flex items-center gap-4 px-5 py-4 sm:px-8 sm:py-5 border-b border-gray-200 dark:border-gray-800">
          {Icon && (
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-900/20">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={onSubmit} noValidate className="flex flex-col flex-1 min-h-0">{body}</form>
        ) : (
          body
        )}
      </div>
    </div>
  );
}
