import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import type { Lang } from '@energetika/shared';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmployeeCard from '@/components/EmployeeCard';
import EmptyState from '@/components/EmptyState';
import { employeesApi, structureApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { unitName, type Unit } from '@/lib/structure';

/** Daraxtni tekis ro'yxatga aylantiradi — guruh sarlavhalari uchun kerak. */
function flatten(units: Unit[]): Unit[] {
  return units.flatMap((unit) => [unit, ...flatten(unit.children ?? [])]);
}

export default function EmployeesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });
  const { data: structureData } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });

  const employees: Employee[] = (employeesData?.data?.data ?? []) as Employee[];
  const units = flatten((structureData?.data?.data ?? []) as Unit[]);

  // Rahbariyat alohida birinchi guruh, keyin bo'linmalar tuzilma tartibida,
  // oxirida bo'linmaga biriktirilmagan xodimlar.
  const management = employees.filter((employee) => employee.isManagement);
  const byUnit = units
    .map((unit) => ({
      id: unit.id,
      name: unitName(unit, lang),
      members: employees.filter((employee) => !employee.isManagement && employee.unitId === unit.id),
    }))
    .filter((group) => group.members.length > 0);
  const assigned = new Set(byUnit.flatMap((group) => group.members.map((m) => m.id)));
  const others = employees.filter(
    (employee) => !employee.isManagement && !assigned.has(employee.id)
  );

  const groups = [
    ...(management.length ? [{ id: 'management', name: t('nav.management'), members: management }] : []),
    ...byUnit,
    ...(others.length ? [{ id: 'others', name: t('employees.no_unit'), members: others }] : []),
  ];

  return (
    <>
      <SeoHead title={t('employees.title')} description={t('employees.subtitle')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('employees.title')}</h1>
          <p className="text-primary-200">{t('employees.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading && <LoadingSpinner />}

        {!isLoading && groups.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <EmptyState icon={Users} title={t('employees.empty')} hint={t('employees.empty_hint')} />
          </div>
        )}

        <div className="space-y-12 max-w-5xl mx-auto">
          {groups.map((group) => (
            <section key={group.id}>
              <div className="flex items-baseline justify-between gap-4 mb-5 pb-2 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{group.name}</h2>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {group.members.length} {t('employees.count')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
