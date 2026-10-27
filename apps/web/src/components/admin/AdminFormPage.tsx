import { useEffect, useRef, type FormEventHandler, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type Size = 'md' | 'lg' | 'full';

const SIZE_CLASS: Record<Size, string> = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  full: 'max-w-none',
};

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: Size;
  /** «Orqaga» — ro'yxatga qaytish. */
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Pastki tugmalar paneli — sahifa aylansa ham ekran pastida turadi. */
  footer: ReactNode;
  /**
   * `true` — bolalar o'zi `FormSection` kartochkalaridan iborat, umumiy oq
   * kartochka kerak emas (masalan, ikki ustunli yangilik shakli).
   */
  bare?: boolean;
  children: ReactNode;
}

/**
 * Admin panelda qo'shish/tahrirlash shakli — alohida oyna emas, ro'yxat
 * o'rnida ochiladigan to'liq sahifa. Sahifa o'z `h1` sarlavhasiga ega
 * (ro'yxat sarlavhasi shakl ochiqligida ko'rsatilmaydi), «Saqlash» paneli
 * `sticky` — uzun shaklda ham doim ko'z oldida.
 */
export default function AdminFormPage({
  title, subtitle, icon: Icon, size = 'lg', onClose, onSubmit, footer, bare, children,
}: Props) {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Shakl ochilganda sahifa boshiga qaytiladi va fokus sarlavhaga o'tadi —
  // ekran o'quvchi yangi sahifa ochilganini eshitadi.
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, []);

  return (
    <div className={clsx('motion-safe:animate-modal-in', SIZE_CLASS[size])}>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('admin.back_to_list')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-900/20">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate focus:outline-none"
          >
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {bare ? (
          <div className="space-y-5">{children}</div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm space-y-5 dark:border-gray-800 dark:bg-gray-900">
            {children}
          </div>
        )}

        <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
          {footer}
        </div>
      </form>
    </div>
  );
}

/** Shakl ichidagi mavzuli blok — sarlavha, ixtiyoriy izoh va maydonlar. */
export function FormSection({
  title, description, icon: Icon, className, children,
}: { title: string; description?: string; icon?: LucideIcon; className?: string; children: ReactNode }) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm',
        className
      )}
    >
      <div className="mb-4 flex items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden="true" />}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
