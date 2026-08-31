import { useTranslation } from 'react-i18next';
import { FileQuestion, Search } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';

/** 404 da ko'rsatiladigan asosiy bo'limlar. Admin havolasi ATAYLAB yo'q. */
const SECTIONS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/news', key: 'nav.news' },
  { to: '/contact', key: 'nav.contact' },
];

export default function NotFoundPage() {
  const { t } = useTranslation();

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

          {/*
            TODO (10-topshiriq): qidiruv tayyor bo'lgach shu maydon
            `/search?q=` ga ulanadi. Hozircha faqat joyi ajratilgan.
          */}
          <div className="mb-10">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                disabled
                aria-label={t('common.search')}
                placeholder={t('notFound.search_placeholder')}
                className="input w-full pl-11 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('notFound.search_soon')}</p>
          </div>

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
