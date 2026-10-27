import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Beaker, Users } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LocalizedLink from '@/components/LocalizedLink';
import A11yImage from '@/components/A11yImage';
import { employeesApi, structureApi } from '@/lib/api';
import { initials, localized, type Employee } from '@/lib/employee';
import { flattenLabs, unitName, type Unit } from '@/lib/structure';

/** Yo'nalishlar matni: har qatorda bittasi. */
function parseDirections(text: string): string[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default function LabsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data, isLoading } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesApi.list(),
  });

  const labs = flattenLabs((data?.data?.data ?? []) as Unit[]);

  // Xodimlar laboratoriya bo'yicha bir marta guruhlanadi.
  const byLab = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const employee of (employeesData?.data?.data ?? []) as Employee[]) {
      if (!employee.labId) continue;
      const list = map.get(employee.labId) ?? [];
      list.push(employee);
      map.set(employee.labId, list);
    }
    return map;
  }, [employeesData]);

  return (
    <>
      <SeoHead title={t('labs.title')} />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-14 sm:py-20">
        <Beaker
          aria-hidden="true"
          className="absolute -right-8 -bottom-10 h-64 w-64 text-white/10 -rotate-12"
        />
        <div className="container relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('labs.title')}</h1>
          <p className="text-primary-100 text-lg max-w-2xl">{t('labs.subtitle')}</p>
          {labs.length > 0 && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
              <Beaker aria-hidden="true" className="h-4 w-4" />
              {labs.length} {t('labs.count')}
            </p>
          )}
        </div>
      </div>

      <div className="container py-12">
        {isLoading && <LoadingSpinner />}

        {!isLoading && labs.length === 0 && (
          <div className="text-center py-12">
            <Beaker aria-hidden="true" className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600">{t('common.not_found')}</p>
          </div>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
          {labs.map((lab) => {
            const name = unitName(lab, lang);
            const record = lab as unknown as Record<string, unknown>;
            const summary = localized(record, 'description', lang);
            const directions = parseDirections(localized(record, 'directions', lang));
            const staff = byLab.get(lab.id) ?? [];
            const head = staff.find((e) => e.isUnitHead);
            const headName = head ? localized(head as unknown as Record<string, unknown>, 'fullName', lang) : '';

            return (
              <li key={lab.id} className="flex">
                <LocalizedLink
                  to={`/laboratories/${lab.id}`}
                  className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900">
                    {lab.imageUrl ? (
                      <A11yImage
                        src={lab.imageUrl}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <div aria-hidden="true" className="flex h-full w-full items-center justify-center">
                        <Beaker className="h-14 w-14 text-white/70" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700">{name}</h2>
                    {summary && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{summary}</p>}

                    {directions.length > 0 && (
                      <ul className="mb-4 flex flex-wrap gap-2 list-none p-0">
                        {directions.slice(0, 3).map((direction) => (
                          <li
                            key={direction}
                            className="max-w-full truncate rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800"
                          >
                            {direction}
                          </li>
                        ))}
                        {directions.length > 3 && (
                          <li className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            +{directions.length - 3}
                          </li>
                        )}
                      </ul>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Users aria-hidden="true" className="h-4 w-4 text-primary-700" />
                        {staff.length} {t('labs.staff')}
                      </span>
                      {head && headName && (
                        <span className="flex min-w-0 items-center gap-2">
                          {head.photoUrl ? (
                            <A11yImage
                              src={head.photoUrl}
                              alt=""
                              className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800"
                            >
                              {initials(headName)}
                            </span>
                          )}
                          <span className="truncate">
                            <span className="sr-only">{t('labs.head')}: </span>
                            {headName}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                      {t('labs.more')}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </span>
                  </div>
                </LocalizedLink>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
