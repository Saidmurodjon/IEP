import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, SearchX, Search } from 'lucide-react';
import clsx from 'clsx';
import SeoHead from '@/components/SeoHead';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LocalizedLink from '@/components/LocalizedLink';
import { searchApi } from '@/lib/api';
import { sanitizeSnippet } from '@/lib/sanitize';
import { formatDate } from '@/lib/date';
import { useCurrentLang } from '@/hooks/useLocalizedPath';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { MIN_QUERY_LENGTH, SEARCH_TYPES, type SearchResponse, type SearchType } from '@/lib/search';

const PAGE_SIZE = 10;

/** Manzildagi `type` qiymati ro'yxatdagi bo'limmi. */
function readType(value: string | null): SearchType | 'all' {
  return SEARCH_TYPES.includes(value as SearchType) ? (value as SearchType) : 'all';
}

/**
 * Qidiruv natijalari sahifasi.
 *
 * So'rov va filtrlar **manzilda** saqlanadi — natijani havola sifatida
 * yuborish yoki xatcho'pga qo'shish mumkin (topshiriq 10, A3).
 */
export default function SearchPage() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const [params, setParams] = useSearchParams();

  const urlQuery = params.get('q') ?? '';
  const type = readType(params.get('type'));
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  // Maydon o'z holatini yuritadi; manzil kechikib yangilanadi, shunda har bir
  // harf uchun so'rov ham, tarixda yangi yozuv ham paydo bo'lmaydi.
  const [input, setInput] = useState(urlQuery);
  const debouncedInput = useDebouncedValue(input, 300);

  // Boshqa sahifadan `?q=` bilan kelinganda maydon shu qiymatdan boshlanadi.
  useEffect(() => setInput(urlQuery), [urlQuery]);

  useEffect(() => {
    if (debouncedInput === urlQuery) return;
    const next = new URLSearchParams(params);
    if (debouncedInput.trim()) next.set('q', debouncedInput.trim());
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
    // `params` ataylab bog'liqlikda emas: filtr o'zgarganda so'rov qayta
    // yozilib ketmasligi kerak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (urlQuery) next.set('q', urlQuery);
    setParams(next);
  };

  const term = urlQuery.trim();
  const enabled = term.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError } = useQuery({
    queryKey: ['search', term, type, from, to, page, lang],
    queryFn: () =>
      searchApi.query({ q: term, type, from, to, lang, page, limit: PAGE_SIZE }),
    enabled,
  });

  const result = enabled ? (data?.data as SearchResponse | undefined) : undefined;
  const groups = result?.groups.filter((group) => group.items.length > 0) ?? [];
  const hasFilters = type !== 'all' || Boolean(from) || Boolean(to);

  return (
    <>
      <SeoHead title={t('search.title')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('search.title')}</h1>
          <p className="text-primary-200">{t('search.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Qidiruv maydoni */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <label htmlFor="search-input" className="sr-only">
            {t('search.title')}
          </label>
          <input
            id="search-input"
            type="search"
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filtrlar */}
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('search.filters')}>
            {(['all', ...SEARCH_TYPES] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => updateParam('type', value === 'all' ? '' : value)}
                aria-pressed={type === value}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-full border transition-colors',
                  type === value
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                )}
              >
                {t(`search.types.${value}`)}
                {result && value !== 'all' && (
                  <span className="ml-1 opacity-70">{result.counts[value] ?? 0}</span>
                )}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="search-from" className="block text-xs text-gray-500 mb-1">
              {t('search.date_from')}
            </label>
            <input
              id="search-from"
              type="date"
              value={from}
              onChange={(event) => updateParam('from', event.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="search-to" className="block text-xs text-gray-500 mb-1">
              {t('search.date_to')}
            </label>
            <input
              id="search-to"
              type="date"
              value={to}
              onChange={(event) => updateParam('to', event.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-primary-700 hover:text-primary-900 underline py-1.5"
            >
              {t('search.reset_filters')}
            </button>
          )}
        </div>

        {/* Natijalar. `aria-live` — ekran o'qigich o'zgarishni e'lon qiladi. */}
        <div className="mt-8" aria-live="polite" aria-busy={isFetching}>
          {!enabled && <p className="text-gray-500">{t('search.min_length')}</p>}

          {enabled && isFetching && <LoadingSpinner />}

          {enabled && isError && <p className="text-red-600">{t('search.error')}</p>}

          {enabled && !isFetching && !isError && result && (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {t('search.results_for', { q: term })} — {t('search.found', { count: result.total })}
              </p>

              {result.total === 0 && (
                <EmptyState
                  icon={SearchX}
                  title={t('search.no_results', { q: term })}
                  hint={t('search.no_results_hint')}
                />
              )}

              {groups.map((group) => (
                <section key={group.type} className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {t(`search.types.${group.type}`)}{' '}
                    <span className="text-sm font-normal text-gray-400">({group.total})</span>
                  </h2>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={`${item.type}-${item.id}`} className="card p-4">
                        <LocalizedLink
                          to={item.url}
                          className="text-primary-800 hover:text-primary-900 font-medium"
                        >
                          {item.title}
                        </LocalizedLink>
                        {item.date && (
                          <time className="block text-xs text-gray-400 mt-0.5">
                            {formatDate(item.date)}
                          </time>
                        )}
                        <p
                          className="text-sm text-gray-600 mt-1.5 [&_mark]:bg-yellow-100 [&_mark]:text-gray-900"
                          dangerouslySetInnerHTML={{ __html: sanitizeSnippet(item.snippet) }}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => updateParam('page', String(page - 1))}
                    disabled={page <= 1}
                    aria-label={t('common.back')}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {page} / {result.totalPages}
                  </span>
                  <button
                    onClick={() => updateParam('page', String(page + 1))}
                    disabled={page >= result.totalPages}
                    aria-label={t('search.submit')}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
