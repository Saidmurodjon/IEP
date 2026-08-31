import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileQuestion, Search } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { MIN_QUERY_LENGTH } from '@/lib/search';

/** 404 da ko'rsatiladigan asosiy bo'limlar. Admin havolasi ATAYLAB yo'q. */
const SECTIONS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/news', key: 'nav.news' },
  { to: '/contact', key: 'nav.contact' },
];

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const localize = useLocalizedPath();
  const [query, setQuery] = useState('');

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    navigate(localize(`/search?q=${encodeURIComponent(trimmed)}`));
  };

  return (
    <>
      {/* Buzilgan havola indekslanmasin — `noindex, follow`. */}
      <SeoHead title={t('notFound.title')} noindex />

      <div className="container py-20 sm:py-24">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-primary-50 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-primary-400" />
          </div>
          <div className="text-5xl sm:text-6xl font-bold text-primary-900 mb-3">404</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('notFound.title')}</h1>
          <p className="text-gray-500 mb-8">{t('notFound.text')}</p>

          <form onSubmit={onSubmit} className="mb-10">
            <label htmlFor="notfound-search" className="sr-only">
              {t('search.title')}
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="notfound-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('notFound.search_placeholder')}
                className="input w-full pl-11"
              />
            </div>
          </form>

          <div className="text-sm font-medium text-gray-700 mb-4">{t('notFound.sections')}</div>
          <div className="flex flex-wrap justify-center gap-2">
            {SECTIONS.map(({ to, key }) => (
              <LocalizedLink
                key={to}
                to={to}
                className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {t(key)}
              </LocalizedLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
