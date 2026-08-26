import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Beaker, Users } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LocalizedLink from '@/components/LocalizedLink';
import EmployeeCard from '@/components/EmployeeCard';
import EmptyState from '@/components/EmptyState';
import { employeesApi, structureApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { flattenLabs, unitName, type Unit } from '@/lib/structure';

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: structureData, isLoading } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const { data: employeesData } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.list(id),
    enabled: !!id,
  });

  const lab = flattenLabs((structureData?.data?.data ?? []) as Unit[]).find((unit) => unit.id === id);
  const employees = (employeesData?.data?.data ?? []) as Employee[];
  // Mudir ro'yxatning boshida, kengaytirilgan kartochkada.
  const head = employees.find((employee) => employee.isUnitHead);
  const members = employees.filter((employee) => !employee.isUnitHead);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!lab) {
    return (
      <>
        <SeoHead title={t('lab.not_found')} noindex />
        <div className="container py-20 text-center">
          <p className="text-gray-500 mb-4">{t('lab.not_found')}</p>
          <LocalizedLink to="/laboratories" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t('lab.back')}
          </LocalizedLink>
        </div>
      </>
    );
  }

  const name = unitName(lab, lang);
  const descKey = `description${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof Unit;
  const description = ((lab[descKey] as string) || lab.descriptionUz || '').trim();

  return (
    <>
      <SeoHead title={name} description={description || undefined} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <LocalizedLink
            to="/laboratories"
            className="flex items-center gap-1 text-primary-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('lab.back')}
          </LocalizedLink>
          <h1 className="text-2xl sm:text-3xl font-bold max-w-4xl leading-snug">{name}</h1>
          {typeof lab.staffCount === 'number' && (
            <p className="text-primary-200 text-sm mt-3 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {lab.staffCount} {t('labs.staff')}
            </p>
          )}
        </div>
      </div>

      <div className="container py-10">
        <div className="max-w-4xl mx-auto space-y-10">
          {description && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Beaker className="h-5 w-5 text-primary-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{t('lab.direction')}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-5">{t('lab.staff_list')}</h2>

            {employees.length === 0 ? (
              <EmptyState icon={Users} title={t('lab.staff_empty')} hint={t('employees.empty_hint')} />
            ) : (
              <div className="space-y-5">
                {head && <EmployeeCard employee={head} variant="extended" badge={t('employee.head')} />}
                {members.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((employee) => (
                      <EmployeeCard key={employee.id} employee={employee} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
