import { useTranslation } from 'react-i18next';
import SeoHead from '@/components/SeoHead';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { pubsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BookOpen, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Lang } from '@energetika/shared';

const CATEGORIES = ['all', 'article', 'monograph', 'conference', 'patent', 'report'];

export default function PublicationsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['publications', page, category],
    queryFn: () => pubsApi.list(page, 20, category === 'all' ? undefined : category),
  });

  const pubs = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const getTitle = (item: Record<string, string>) =>
    item[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ?? item.titleUz ?? '';

  return (
    <>
      <SeoHead title={t('publications.title')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('publications.title')}</h1>
          <p className="text-primary-200">{t('publications.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={clsx(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                category === cat
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
              )}
            >
              {t(`publications.${cat}`)}
            </button>
          ))}
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && pubs.length === 0 && (
          <div className="card border-dashed border-2 border-gray-200 bg-gray-50/60 py-16 px-6 text-center">
            <div className="bg-white shadow-sm rounded-full w-16 h-16 mx-auto mb-5 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-primary-300" />
            </div>
            <p className="text-gray-700 font-medium">{t('publications.no_pubs')}</p>
            <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">{t('publications.empty_hint')}</p>
          </div>
        )}

        <div className="space-y-4">
          {pubs.map((pub: Record<string, string | number>) => (
            <div key={pub.id as string} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary-100 text-primary-700 p-2.5 rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{getTitle(pub as Record<string, string>)}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700">{t('publications.authors')}:</span>{' '}
                    {pub.authors as string}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    {pub.journal && (
                      <span>
                        <span className="font-medium">{t('publications.journal')}:</span> {pub.journal as string}
                      </span>
                    )}
                    <span>{t('publications.year')}: {pub.year as number}</span>
                    {pub.doi && <span>DOI: {pub.doi as string}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {pub.fileUrl && (
                    <a
                      href={pub.fileUrl as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
