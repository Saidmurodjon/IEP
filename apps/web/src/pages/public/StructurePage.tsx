import { useTranslation } from 'react-i18next';
import SeoHead from '@/components/SeoHead';
import StructureChart from '@/components/StructureChart';
import { parseStructureChart } from '@/lib/api';
import { useSettings } from '@/hooks/useSettings';

export default function StructurePage() {
  const { t } = useTranslation();
  const { value } = useSettings();
  // Sxema yuklanmagan bo'lsa, bo'sh sahifa o'rniga qisqa xabar ko'rsatiladi.
  const hasChart = parseStructureChart(value('structureChart')) !== null;

  return (
    <>
      <SeoHead title={t('structure.title')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('structure.title')}</h1>
          <p className="text-primary-200">{t('structure.subtitle')}</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <StructureChart />
          {!hasChart && (
            <p className="text-gray-600 text-center py-8">{t('structure.chart_empty')}</p>
          )}
        </div>
      </div>
    </>
  );
}
