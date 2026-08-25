import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
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
        <Link to="/news" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getField('title')} | {t('common.institute_name')}</title>
        <meta name="description" content={getField('summary')} />
      </Helmet>

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-10">
        <div className="container">
          <Link
            to="/news"
            className="flex items-center gap-1 text-primary-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('nav.news')}
          </Link>
          <h1 className="text-2xl font-bold max-w-3xl">{getField('title')}</h1>
          <time className="flex items-center gap-1 text-primary-200 text-sm mt-3">
            <Calendar className="h-4 w-4" />
            {format(new Date((item as Record<string, string>).publishedAt), 'dd MMMM yyyy')}
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
            dangerouslySetInnerHTML={{ __html: getField('content') }}
          />
        </div>
      </div>
    </>
  );
}
