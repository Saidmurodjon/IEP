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
          {labs.map((lab, index) => {
            const name = unitName(lab, lang);
            const record = lab as unknown as Record<string, unknown>;
            const summary = localized(record, 'description', lang);
            const staff = byLab.get(lab.id) ?? [];
            const head = staff.find((e) => e.isUnitHead);
            const headName = head ? localized(head as unknown as Record<string, unknown>, 'fullName', lang) : '';

            return (
              <li key={lab.id} className="flex">
                <LocalizedLink
                  to={`/laboratories/${lab.id}`}
                  className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary-900/15 hover:border-primary-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950">
                    {lab.imageUrl ? (
                      <>
                        <A11yImage
                          src={lab.imageUrl}
                          alt={name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent" />
                      </>
                    ) : (
                      <div aria-hidden="true" className="absolute inset-0">
                        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent-400/30 blur-3xl transition-transform duration-700 group-hover:-translate-x-6 group-hover:translate-y-4 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
                        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary-400/30 blur-3xl" />
                        <Beaker className="absolute -bottom-6 right-6 h-32 w-32 -rotate-12 text-white/[0.07]" />
                      </div>
                    )}

                    <span
                      aria-hidden="true"
                      className="absolute right-5 top-3 text-5xl font-black tabular-nums tracking-tight text-white/15"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 left-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent-500 group-hover:ring-accent-300 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    >
                      <Beaker className="h-6 w-6" />
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="block h-1 origin-left scale-x-0 bg-gradient-to-r from-accent-400 to-accent-600 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
                  />

                  <div className="flex flex-1 flex-col p-6 pt-5">
                    <h2 className="text-lg font-bold leading-snug text-gray-900 mb-2 transition-colors group-hover:text-primary-700">{name}</h2>
                    {summary && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{summary}</p>}

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
