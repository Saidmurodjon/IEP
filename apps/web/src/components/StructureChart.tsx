import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/date';
import { Download, ExternalLink } from 'lucide-react';
import { fileUrl, parseStructureChart } from '@/lib/api';
import { useSettings } from '@/hooks/useSettings';
import A11yImage from '@/components/A11yImage';

/**
 * Rasman tasdiqlangan tuzilma sxemasi (rasm). Sxema yuklanmagan
 * bo'lsa hech narsa chiqarmaydi. Sahifaning `h1` dan keyingi `h2` sarlavhasi.
 */
export default function StructureChart() {
  const { t } = useTranslation();
  const { value } = useSettings();
  const chart = parseStructureChart(value('structureChart'));
  if (!chart) return null;

  const src = fileUrl(chart.url);
  const dateText = Number.isNaN(new Date(chart.updatedAt).getTime()) ? '' : formatDate(chart.updatedAt);

  const linkClass = 'btn-secondary gap-2 inline-flex items-center';

  return (
    <section aria-labelledby="structure-chart-title" className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 id="structure-chart-title" className="text-xl font-bold text-gray-900">
            {t('structure.chart_title')}
          </h2>
          {dateText && (
            <p className="text-sm text-gray-600 mt-1">
              {t('structure.chart_updated', { date: dateText })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={src} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t('structure.chart_open')}
            <span className="sr-only"> {t('a11y.new_tab')}</span>
          </a>
          <a href={src} download={chart.name} className={linkClass}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('structure.chart_download')}
          </a>
        </div>
      </div>

      <a href={src} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-gray-200 bg-white p-2">
        <A11yImage src={chart.url} alt={t('structure.chart_image_alt')} className="mx-auto max-w-full h-auto" />
        <span className="sr-only">{t('a11y.new_tab')}</span>
      </a>
    </section>
  );
}
