import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Beaker } from 'lucide-react';
import type { Lang } from '@energetika/shared';

interface Unit {
  id: string; nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  head?: string | null; type: string; staffCount?: number | null; children?: Unit[];
}

function flattenLabs(units: Unit[]): Unit[] {
  const labs: Unit[] = [];
  for (const unit of units) {
    if (unit.type === 'laboratory') labs.push(unit);
    if (unit.children) labs.push(...flattenLabs(unit.children));
  }
  return labs;
}

export default function LabsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });

  const tree: Unit[] = data?.data?.data ?? [];
  const labs = flattenLabs(tree);

  const getName = (unit: Unit) => {
    const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit;
    return (unit[key] as string) ?? unit.nameUz;
  };
  const getDesc = (unit: Unit) => {
    const key = `description${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit;
    return (unit[key] as string) ?? unit.descriptionUz;
  };

  return (
    <>
      <Helmet>
        <title>{t('labs.title')} | Energetika instituti</title>
      </Helmet>

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('labs.title')}</h1>
          <p className="text-primary-200">{t('labs.subtitle')}</p>
        </div>
      </div>

      <div className="container py-12">
        {isLoading && <LoadingSpinner />}

        {!isLoading && labs.length === 0 && (
          <div className="text-center py-12">
            <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('common.not_found')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div key={lab.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                <Beaker className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{getName(lab)}</h3>
              {getDesc(lab) && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{getDesc(lab)}</p>
              )}
              {typeof lab.staffCount === 'number' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 border-t border-gray-100 pt-3 mt-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{lab.staffCount} {t('labs.staff')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
