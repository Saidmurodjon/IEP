import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmployeeCard from '@/components/EmployeeCard';
import EmptyState from '@/components/EmptyState';
import { employeesApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';

/**
 * Rahbariyat. Tartib `order` bo'yicha — tuzilma hujjatidagi ketma-ketlik
 * (direktor, ilm-fan o'rinbosari, umumiy masalalar o'rinbosari, ilmiy kotib)
 * admin panelda `order` orqali beriladi.
 */
export default function ManagementPage() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const management: Employee[] = ((data?.data?.data ?? []) as Employee[])
    .filter((employee) => employee.isManagement);

  return (
    <>
      <SeoHead title={t('management.title')} description={t('management.subtitle')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('management.title')}</h1>
          <p className="text-primary-200">{t('management.subtitle')}</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading && <LoadingSpinner />}

        {!isLoading && management.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <EmptyState icon={Users} title={t('management.empty')} hint={t('management.empty_hint')} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {management.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} variant="extended" />
          ))}
        </div>
      </div>
    </>
  );
}
