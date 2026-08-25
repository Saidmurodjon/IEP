import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Lang } from '@energetika/shared';
import clsx from 'clsx';

interface Unit {
  id: string;
  nameUz: string; nameEn: string; nameRu: string;
  descriptionUz: string; descriptionEn: string; descriptionRu: string;
  head?: string | null;
  type: string;
  staffCount?: number | null;
  isAdvisory?: boolean;
  order: number;
  children?: Unit[];
}

const TYPE_COLORS: Record<string, string> = {
  department: 'bg-primary-100 text-primary-700 border-primary-200',
  laboratory: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  center: 'bg-purple-100 text-purple-700 border-purple-200',
  division: 'bg-orange-100 text-orange-700 border-orange-200',
  sector: 'bg-gray-100 text-gray-600 border-gray-200',
  council: 'bg-accent-100 text-accent-700 border-accent-200',
  position: 'bg-primary-50 text-primary-600 border-primary-200',
  service: 'bg-gray-100 text-gray-600 border-gray-200',
};

function StructureNode({ unit, lang, depth = 0 }: { unit: Unit; lang: string; depth?: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = unit.children && unit.children.length > 0;

  const name = unit[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit] as string
    ?? unit.nameUz;
  const desc = unit[`description${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit] as string
    ?? unit.descriptionUz;

  return (
    <div className={clsx('relative', depth > 0 && 'ml-6 border-l-2 border-gray-200 pl-4')}>
      <div className={clsx(
        'card p-4 mb-3 hover:shadow-md transition-shadow',
        depth === 0 && 'border-primary-200 bg-primary-50',
        // Maslahat organi — hujjatda punktir chiziq, bo'ysunuvchi emas.
        unit.isAdvisory && 'border-dashed border-2 border-accent-300 bg-accent-50'
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded border',
                TYPE_COLORS[unit.type] ?? TYPE_COLORS.department
              )}>
                {t(`structure.type_${unit.type}`)}
              </span>
              {unit.isAdvisory && (
                <span className="text-xs font-medium px-2 py-0.5 rounded border bg-accent-100 text-accent-700 border-accent-300">
                  {t('structure.advisory')}
                </span>
              )}
              <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
            </div>
            {typeof unit.staffCount === 'number' && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Users className="h-3 w-3" />
                <span>{unit.staffCount} {t('structure.staff')}</span>
              </div>
            )}
            {unit.head && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Users className="h-3 w-3" />
                <span>{unit.head}</span>
              </div>
            )}
            {desc && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{desc}</p>}
          </div>
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {expanded
                ? <ChevronDown className="h-4 w-4" />
                : <ChevronRight className="h-4 w-4" />
              }
            </button>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {unit.children!.map((child) => (
            <StructureNode key={child.id} unit={child} lang={lang} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructurePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading, error } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });

  const tree: Unit[] = data?.data?.data ?? [];

  return (
    <>
      <Helmet>
        <title>{t('structure.title')} | Energetika instituti</title>
      </Helmet>

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('structure.title')}</h1>
          <p className="text-primary-200">{t('structure.subtitle')}</p>
        </div>
      </div>

      <div className="container py-12">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500 text-center">{t('common.error')}</p>}
        {!isLoading && tree.length === 0 && (
          <p className="text-gray-500 text-center py-8">{t('common.not_found')}</p>
        )}
        <div className="max-w-3xl mx-auto">
          {tree.map((unit) => (
            <StructureNode key={unit.id} unit={unit} lang={lang} depth={0} />
          ))}
        </div>
      </div>
    </>
  );
}
