import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface MenuOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  lang?: string;
}

interface HeaderMenuProps<T extends string> {
  label: string;
  trigger: ReactNode;
  options: MenuOption<T>[];
  value: T;
  onSelect: (value: T) => void;
}

/** Asosiy sayt sarlavhasidagi til ro'yxati uslubidagi kichik ochiladigan menyu. */
export default function HeaderMenu<T extends string>({ label, trigger, options, value, onSelect }: HeaderMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          {options.map(({ value: v, label: text, icon: Icon, lang }) => (
            <button
              key={v}
              type="button"
              role="menuitem"
              lang={lang}
              aria-current={value === v}
              onClick={() => {
                onSelect(v);
                setOpen(false);
              }}
              className={clsx(
                'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
                value === v
                  ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              <span className="flex-1">{text}</span>
              {value === v && <Check className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
