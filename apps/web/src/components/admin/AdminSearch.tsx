import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, Newspaper, BookOpen, Users, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { statsApi } from '@/lib/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminRange } from '@/store/adminPeriod';
import { formatDate } from '@/lib/date';

const MIN_CHARS = 2;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

interface Hit { id: string; title: string; meta?: string }
interface Group { key: string; icon: LucideIcon; to: string; hits: Hit[] }

/**
 * Navbar qidiruvi: maydon navbar'ning o'zida, natijalar ostida ochiladi.
 * Yangiliklar, nashrlar, xodimlar va murojaatlar bo'yicha; navbar'dagi davr filtri qo'llanadi.
 * `Ctrl/⌘+K` maydonga fokus beradi, `Escape` natijalarni yopadi.
 */
export default function AdminSearch() {
  const { t, i18n } = useTranslation();
  const ts = (k: string, o?: Record<string, unknown>) => t(`adminShell.search.${k}`, o);
  const { range } = useAdminRange();
  const { pathname } = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(q.trim(), 300);
  const enabled = debounced.length >= MIN_CHARS;

  const query = useQuery({
    queryKey: ['admin-search', debounced, range.from, range.to],
    queryFn: () => statsApi.search(debounced, range),
    enabled,
  });
  const data = query.data?.data?.data;

  // Boshqa sahifaga o'tilganda natijalar yopiladi.
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
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
  }, []);

  const lang = i18n.language;
  const pick = (uz: string, en: string, ru: string) =>
    (lang.startsWith('ru') ? ru : lang.startsWith('en') ? en : uz) || uz;

  const groups: Group[] = data ? [
    {
      key: 'news', icon: Newspaper, to: '/admin/news',
      hits: data.news.map((n) => ({
        id: n.id, title: pick(n.titleUz, n.titleEn, n.titleRu),
        meta: n.isPublished ? formatDate(n.publishedAt) : ts('draft'),
      })),
    },
    {
      key: 'publications', icon: BookOpen, to: '/admin/publications',
      hits: data.publications.map((p) => ({ id: p.id, title: pick(p.titleUz, p.titleEn, p.titleRu), meta: String(p.year) })),
    },
    {
      key: 'employees', icon: Users, to: '/admin/employees',
      hits: data.employees.map((e) => ({
        id: e.id, title: pick(e.fullNameUz, e.fullNameEn, e.fullNameRu),
        meta: e.isActive ? undefined : ts('inactive'),
      })),
    },
    {
      key: 'appeals', icon: MessageSquare, to: '/admin/messages',
      hits: data.appeals.map((a) => ({
        id: a.id, title: `${a.ticketNumber} · ${a.subject}`,
        meta: `${a.name} · ${t(`admin.dashboardStats.status.${a.status}`)}`,
      })),
    },
  ].filter((g) => g.hits.length > 0) : [];

  let status = '';
  if (enabled && query.isFetching) status = ts('loading');
  else if (enabled && query.isError) status = ts('error');
  else if (enabled && data) {
    const total = groups.reduce((s, g) => s + g.hits.length, 0);
    status = total === 0 ? ts('noResults') : ts('found', { count: total });
  } else if (q.trim().length > 0) status = ts('minChars', { count: MIN_CHARS });

  const showPanel = open && q.trim().length > 0;
  const clear = () => { setQ(''); inputRef.current?.focus(); };

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <label htmlFor="admin-search" className="sr-only">{ts('label')}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 dark:text-gray-300" aria-hidden="true" />
      <input
        ref={inputRef}
        id="admin-search"
        type="search"
        value={q}
        placeholder={ts('trigger')}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (showPanel) setOpen(false);
            else setQ('');
          }
        }}
        aria-expanded={showPanel}
        aria-controls="admin-search-panel"
        aria-describedby="admin-search-status"
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-1.5 pl-9 pr-16 text-sm text-gray-900 placeholder:text-gray-600 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:bg-gray-800 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
        {q ? (
          <button
            type="button"
            onClick={clear}
            aria-label={ts('clear')}
            className="rounded p-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-gray-300 px-1.5 font-sans text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300 md:block" aria-hidden="true">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        )}
      </div>

      {/* Holat ekran o'qigichga doim e'lon qilinadi, ko'zga — faqat panel ochiq bo'lsa. */}
      <p id="admin-search-status" aria-live="polite" className="sr-only">{status}</p>

      {showPanel && (
        <div
          id="admin-search-panel"
          className="absolute left-0 right-0 z-40 mt-2 max-h-[70vh] min-w-[18rem] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 md:min-w-[32rem]"
        >
          <p className="px-4 py-2 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800" aria-hidden="true">
            {status}
          </p>
          {groups.map(({ key, icon: Icon, to, hits }) => (
            <section key={key} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
              <h2 className="flex items-center justify-between px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden="true" />{ts(`groups.${key}`)}</span>
                <Link to={to} className="font-normal normal-case tracking-normal text-primary-700 hover:underline dark:text-primary-300">
                  {ts('openSection')}
                </Link>
              </h2>
              <ul className="pb-2">
                {hits.map((h) => (
                  <li key={h.id}>
                    <Link to={to} className="block px-4 py-1.5 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                      <span className="block truncate text-sm text-gray-800 dark:text-gray-100">{h.title}</span>
                      {h.meta && <span className="block text-xs text-gray-600 dark:text-gray-400">{h.meta}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
