import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, X, Newspaper, BookOpen, Users, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { statsApi } from '@/lib/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatDate } from '@/lib/date';

const MIN_CHARS = 2;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

interface Hit { id: string; title: string; meta?: string }
interface Group { key: string; icon: LucideIcon; to: string; hits: Hit[] }

/** Qidiruv oynasi: yangiliklar, nashrlar, xodimlar va murojaatlar bo'yicha. */
function SearchDialog({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const ts = (k: string, o?: Record<string, unknown>) => t(`adminShell.search.${k}`, o);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true, onClose);
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q.trim(), 300);
  const enabled = debounced.length >= MIN_CHARS;

  const query = useQuery({
    queryKey: ['admin-search', debounced],
    queryFn: () => statsApi.search(debounced),
    enabled,
  });
  const data = query.data?.data?.data;

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

  let status = ts('hint');
  if (enabled && query.isFetching) status = ts('loading');
  else if (enabled && query.isError) status = ts('error');
  else if (enabled && data) {
    const total = groups.reduce((s, g) => s + g.hits.length, 0);
    status = total === 0 ? ts('noResults') : ts('found', { count: total });
  } else if (q.trim().length > 0 && !enabled) status = ts('minChars', { count: MIN_CHARS });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-search-label"
        className="w-full max-w-2xl max-h-[75vh] flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <label id="admin-search-label" htmlFor="admin-search" className="sr-only">{ts('label')}</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300" aria-hidden="true" />
            {/* Fokus-qopqon birinchi elementga fokus beradi — shuning uchun maydon birinchi turadi. */}
            <input
              id="admin-search"
              type="search"
              className="input pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
              value={q}
              placeholder={ts('placeholder')}
              onChange={(e) => setQ(e.target.value)}
              aria-describedby="admin-search-status"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label={ts('close')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p id="admin-search-status" aria-live="polite" className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            {status}
          </p>
        </div>
        {groups.length > 0 && (
          <div className="overflow-y-auto p-4 grid gap-3 sm:grid-cols-2">
            {groups.map(({ key, icon: Icon, to, hits }) => (
              <section key={key} className="rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden="true" />{ts(`groups.${key}`)}</span>
                  <Link to={to} onClick={onClose} className="text-xs font-normal text-primary-700 dark:text-primary-300 hover:underline">
                    {ts('openSection')}
                  </Link>
                </h2>
                <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                  {hits.map((h) => (
                    <li key={h.id} className="px-3 py-2">
                      <Link to={to} onClick={onClose} className="block text-sm text-gray-800 dark:text-gray-100 truncate hover:text-primary-700 dark:hover:text-primary-300">
                        {h.title}
                      </Link>
                      {h.meta && <p className="text-xs text-gray-600 dark:text-gray-400">{h.meta}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Navbar'dagi qidiruv ikonkasi. `Ctrl+K` / `⌘K` ham ochadi. */
export default function AdminSearch() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Katta ekranda qidiruv maydoniga o'xshash keng tugma, mobilda faqat ikonka. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('adminShell.search.open')}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:w-full md:max-w-md md:border md:border-gray-300 md:bg-gray-50 md:px-3 md:py-1.5 md:hover:bg-white dark:md:border-gray-700 dark:md:bg-gray-800/60 dark:md:hover:bg-gray-800"
      >
        <Search className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" aria-hidden="true" />
        <span className="hidden md:block flex-1 text-left text-sm truncate">{t('adminShell.search.trigger')}</span>
        <kbd className="hidden md:block rounded border border-gray-300 px-1.5 text-xs font-sans text-gray-600 dark:border-gray-600 dark:text-gray-300" aria-hidden="true">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}
