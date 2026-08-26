import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { documentsApi } from '@/lib/api';
import { localized } from '@/lib/employee';
import { formatDate } from '@/lib/date';

interface DocumentItem {
  id: string;
  titleUz: string; titleEn: string; titleRu: string;
  descriptionUz?: string | null; descriptionEn?: string | null; descriptionRu?: string | null;
  fileKey: string;
  documentNumber?: string | null;
  documentDate?: string | null;
}

export default function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list(),
  });
  const items: DocumentItem[] = data?.data?.data ?? [];

  return (
    <>
      <SeoHead title={t('documents.title')} description={t('documents.subtitle')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('documents.title')}</h1>
          <p className="text-primary-200">{t('documents.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading && <LoadingSpinner />}

        {!isLoading && items.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <EmptyState icon={FileText} title={t('documents.empty')} hint={t('documents.empty_hint')} />
          </div>
        )}

        <div className="space-y-3 max-w-3xl mx-auto">
          {items.map((item) => {
            const record = item as unknown as Record<string, unknown>;
            const title = localized(record, 'title', lang);
            const description = localized(record, 'description', lang);
            return (
              <div key={item.id} className="card p-5 flex items-start gap-4">
                <div className="bg-primary-100 text-primary-700 p-2.5 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900 leading-snug">{title}</h2>
                  {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                    {item.documentNumber && (
                      <span>{t('documents.number')}: {item.documentNumber}</span>
                    )}
                    {item.documentDate && (
                      <span>{t('documents.date')}: {formatDate(item.documentDate)}</span>
                    )}
                  </div>
                </div>
                <a
                  href={`/api/files/${item.fileKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary gap-2 flex-shrink-0 text-sm px-3 py-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('documents.download')}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
