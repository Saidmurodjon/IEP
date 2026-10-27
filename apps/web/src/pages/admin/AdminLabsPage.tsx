import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Plus, Trash2, Users, Crown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi, fileUrl } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { initials } from '@/lib/employee';
import { flattenLabs, type Unit } from '@/lib/structure';
import { useToast } from '@/components/Toast';

/** Laboratoriya kartochkasi to'liqligi: nechta bo'lim to'ldirilgan. */
export function labCompleteness(lab: Unit): { done: number; total: number; missing: string[] } {
  const checks: Array<[string, boolean]> = [
    ['translations', Boolean(lab.nameEn?.trim() && lab.nameRu?.trim())],
    ['summary', Boolean(lab.descriptionUz?.trim())],
    ['content', Boolean(lab.contentUz?.trim())],
    ['image', Boolean(lab.imageUrl)],
    ['contacts', Boolean(lab.email || lab.phone || lab.room)],
  ];
  return {
    done: checks.filter(([, ok]) => ok).length,
    total: checks.length,
    missing: checks.filter(([, ok]) => !ok).map(([k]) => k),
  };
}

export default function AdminLabsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({ queryKey: ['structure-admin'], queryFn: () => structureApi.tree() });
  const { data: empData } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => employeesApi.list(undefined, true),
  });
  const employees: Employee[] = empData?.data?.data ?? [];

  const labs = useMemo(
    () => flattenLabs((data?.data?.data ?? []) as Unit[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data],
  );

  const deleteMut = useMutation({
    mutationFn: (id: string) => structureApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure-admin'] });
      qc.invalidateQueries({ queryKey: ['structure'] });
      toast.success(t('adminLab.deleted'));
    },
    onError: (error) => toast.showError(error),
  });

  return (
    <>
      <Helmet><title>{t('admin.labs')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              <FlaskConical className="h-6 w-6" aria-hidden="true" /> {t('admin.labs')}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('adminLab.subtitle')}</p>
          </div>
          <Link to="/admin/labs/new" className="btn-primary gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('adminD.units.add_lab')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
            <span className="sr-only">{t('common.loading')}</span>
          </div>
        ) : labs.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              <FlaskConical className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('adminLab.empty_title')}</p>
            <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">{t('adminLab.empty_text')}</p>
            <Link to="/admin/labs/new" className="btn-primary mt-2 gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" /> {t('adminD.units.add_lab')}
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {labs.map((lab) => {
              const staff = employees.filter((e) => e.labId === lab.id);
              const head = staff.find((e) => e.isUnitHead);
              const { done, total, missing } = labCompleteness(lab);
              const pct = Math.round((done / total) * 100);
              return (
                <li key={lab.id} className="group relative">
                  <Link
                    to={`/admin/labs/${lab.id}`}
                    className="card block h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-900">
                      {lab.imageUrl ? (
                        <img src={fileUrl(lab.imageUrl)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <FlaskConical className="absolute inset-0 m-auto h-14 w-14 text-white/40" aria-hidden="true" />
                      )}
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-900/90 dark:text-gray-100">
                        {t('adminLab.open')} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <h2 className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">{lab.nameUz}</h2>
                      <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-600 dark:text-gray-400">
                        {lab.descriptionUz || t('adminLab.no_summary')}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          <Users className="h-3.5 w-3.5" aria-hidden="true" /> {t('adminLab.staff_count', { count: staff.length })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {head ? (
                          <>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-[11px] font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                              {head.photoUrl ? <img src={fileUrl(head.photoUrl)} alt="" className="h-full w-full object-cover" /> : initials(head.fullNameUz)}
                            </span>
                            <span className="min-w-0 truncate text-gray-800 dark:text-gray-200">{head.fullNameUz}</span>
                            <Crown className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-label={t('adminLab.head')} />
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">{t('adminLab.no_head')}</span>
                        )}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{t('adminLab.completeness')}</span>
                          <span className="font-medium">{done}/{total}</span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={t('adminLab.completeness')}
                          className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
                        >
                          <div
                            className={clsx('h-full rounded-full transition-all', pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-primary-500' : 'bg-amber-500')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {missing.length > 0 && (
                          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                            {t('adminLab.missing')}: {missing.map((m) => t(`adminLab.c_${m}`)).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(lab.id); }}
                    disabled={deleteMut.isPending}
                    aria-label={`${t('admin.delete')}: ${lab.nameUz}`}
                    className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-red-950 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
