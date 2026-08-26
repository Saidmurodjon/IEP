import { useParams } from 'react-router-dom';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import SeoHead from '@/components/SeoHead';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/date';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Lang } from '@energetika/shared';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => newsApi.get(slug!),
    enabled: !!slug,
  });

  const item = data?.data?.data;

  const getField = (field: string) => {
    if (!item) return '';
    const key = `${field}${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    return (item as Record<string, string>)[key] ?? (item as Record<string, string>)[`${field}Uz`] ?? '';
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !item) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500">{t('common.not_found')}</p>
        <LocalizedLink to="/news" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </LocalizedLink>
      </div>
    );
  }

  const sourceName = (item as Record<string, string>).sourceName ?? '';
  const sourceUrl = (item as Record<string, string>).sourceUrl ?? '';

  return (
    <>
      <SeoHead title={getField('title')} description={getField('summary')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-10">
        <div className="container">
          <LocalizedLink
            to="/news"
            className="flex items-center gap-1 text-primary-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('nav.news')}
          </LocalizedLink>
          <h1 className="text-2xl font-bold max-w-3xl">{getField('title')}</h1>
          <time className="flex items-center gap-1 text-primary-200 text-sm mt-3">
            <Calendar className="h-4 w-4" />
            {formatDate((item as Record<string, string>).publishedAt)}
          </time>
        </div>
      </div>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          {(item as Record<string, string>).imageUrl && (
            <img
              src={(item as Record<string, string>).imageUrl}
              alt={getField('title')}
              className="w-full rounded-xl mb-8 shadow-sm"
            />
          )}
          <p className="text-lg text-gray-600 mb-6 italic border-l-4 border-primary-300 pl-4">
            {getField('summary')}
          </p>
          <div
            className="prose-content"
            // Server saqlashdan oldin tozalagan; bu ikkinchi qatlam (CLAUDE.md 7-qoida).
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(getField('content')) }}
          />

          {/*
            373-son qarorning 4-bandi: boshqa manbadan olingan axborot faqat
            manba ko'rsatilgan holda joylashtiriladi.
          */}
          {sourceName && (
            <div className="mt-10 pt-5 border-t border-gray-100 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{t('news.source')}:</span>{' '}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-primary-700 hover:underline"
                >
                  {sourceName}
                </a>
              ) : (
                sourceName
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
