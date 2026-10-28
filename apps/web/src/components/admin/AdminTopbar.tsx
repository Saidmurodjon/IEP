import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, LogOut, Menu, Monitor, Moon, Sun, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAdminPrefs, useResolvedAdminTheme, type AdminLang, type AdminTheme } from '@/store/adminPrefs';
import HeaderMenu from '@/components/admin/HeaderMenu';
import AdminSearch from '@/components/admin/AdminSearch';
import PeriodFilter from '@/components/admin/PeriodFilter';

const LANGS: AdminLang[] = ['uz', 'en', 'ru'];
const THEMES: { value: AdminTheme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

function initials(name: string | undefined, email: string | undefined): string {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

interface Props {
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export default function AdminTopbar({ onOpenSidebar, onLogout }: Props) {
  const { t } = useTranslation();
  const admin = useAuthStore((s) => s.admin);
  const { theme, setTheme, lang, setLang } = useAdminPrefs();
  const ThemeIcon = useResolvedAdminTheme() === 'dark' ? Moon : Sun;
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

  const itemClass =
    'flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800';

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label={t('a11y.open_menu')}
        className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex flex-1 items-center gap-1">
        <AdminSearch />
        <PeriodFilter />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <HeaderMenu
          label={t('adminShell.theme')}
          trigger={<ThemeIcon className="h-5 w-5" aria-hidden="true" />}
          value={theme}
          onSelect={setTheme}
          options={THEMES.map(({ value, icon }) => ({ value, icon, label: t(`adminShell.theme_${value}`) }))}
        />
        <HeaderMenu
          label={t('adminShell.language')}
          trigger={
            <>
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="hidden uppercase sm:block">{lang}</span>
            </>
          }
          value={lang}
          onSelect={setLang}
          options={LANGS.map((code) => ({ value: code, lang: code, label: t(`adminShell.lang_${code}`) }))}
        />

        <div className="relative" ref={wrapRef}>
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">
              {initials(admin?.name, admin?.email)}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-gray-800 dark:text-gray-100 sm:inline">
              {admin?.name || admin?.email}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-gray-500 dark:text-gray-400 sm:block" aria-hidden="true" />
            <span className="sr-only">{t('adminShell.profile_menu')}</span>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{admin?.name}</div>
                <div className="truncate text-xs text-gray-600 dark:text-gray-400">{admin?.email}</div>
                {admin?.role && (
                  <span className="mt-1.5 inline-block rounded bg-primary-50 px-2 py-0.5 text-xs text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                    {t(`usersPage.role_${admin.role}`)}
                  </span>
                )}
              </div>
              <Link to="/admin/profile" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                <User className="h-4 w-4" aria-hidden="true" />
                {t('adminShell.profile')}
              </Link>
              <button type="button" role="menuitem" onClick={onLogout} className={itemClass}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t('admin.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
