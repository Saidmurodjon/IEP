import { useTranslation } from 'react-i18next';
import SeoHead from '@/components/SeoHead';
import { useQuery } from '@tanstack/react-query';
import LocalizedLink from '@/components/LocalizedLink';
import { useState } from 'react';
import { newsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/date';
import type { Lang } from '@energetika/shared';

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => newsApi.list(page, 9),
  });

  const news = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const getField = (item: Record<string, string>, field: string) =>
    item[`${field}${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ?? item[`${field}Uz`] ?? '';

  return (
    <>
      <SeoHead title={t('news.title')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('news.title')}</h1>
          <p className="text-primary-200">{t('news.subtitle')}</p>
        </div>
      </div>

      <div className="container py-12">
        {isLoading && <LoadingSpinner />}

        {!isLoading && news.length === 0 && (
          <p className="text-gray-500 text-center py-8">{t('news.no_news')}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item: Record<string, string>) => (
            <article key={item.id} className="card hover:shadow-md transition-shadow flex flex-col">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={getField(item, 'title')} className="w-full h-48 object-cover" />
              )}
              {!item.imageUrl && (
                <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary-400" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <time className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.publishedAt)}
                </time>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">
                  {getField(item, 'title')}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {getField(item, 'summary')}
                </p>
                <LocalizedLink
                  to={`/news/${item.slug}`}
                  className="text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center gap-1"
                >
                  {t('news.read_more')} <ArrowRight className="h-3.5 w-3.5" />
                </LocalizedLink>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
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
