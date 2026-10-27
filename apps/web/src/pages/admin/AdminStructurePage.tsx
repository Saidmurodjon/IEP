import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import StructureChartCard from '@/components/admin/StructureChartCard';

export default function AdminStructurePage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet><title>Tuzilma | Admin</title></Helmet>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.structure')}</h1>

        <StructureChartCard />
      </div>
    </>
  );
}
