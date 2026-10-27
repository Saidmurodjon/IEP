import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, EyeOff, Eye } from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Employee } from '@/lib/employee';
import { type Unit } from '@/lib/structure';
import { useToast } from '@/components/Toast';
import EmployeeForm from '@/components/admin/EmployeeForm';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';

/** Daraxtni tekis ro'yxatga aylantiradi — biriktirish uchun ro'yxat. */
function flatten(units: Unit[], depth = 0): Array<{ unit: Unit; depth: number }> {
  return units.flatMap((unit) => [{ unit, depth }, ...flatten(unit.children ?? [], depth + 1)]);
}

export default function AdminEmployeesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees'],
    // Admin panelda ishdan ketgan xodimlar ham ko'rinadi.
    queryFn: () => employeesApi.list(undefined, true),
  });
  const { data: structureData } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });

  const items: Employee[] = data?.data?.data ?? [];
  const units = flatten((structureData?.data?.data ?? []) as Unit[]).map(({ unit }) => unit);
  // Bo'lim va laboratoriya mustaqil tanlanadi.
  const sections = units.filter((unit) => unit.type === 'section');
  const labs = units.filter((unit) => unit.type === 'laboratory');

  // «Bo'linmalar» sahifasidagi laboratoriyadan «Yangi xodim» — shakl shu lab bilan ochiladi.
  const [searchParams, setSearchParams] = useSearchParams();
  const presetLab = searchParams.get('labId');
  const [pendingLab, setPendingLab] = useState<string | null>(null);
  useEffect(() => {
    if (!presetLab) return;
    setEditItem(null);
    setShowForm(true);
    setPendingLab(presetLab);
    setSearchParams({}, { replace: true });
  }, [presetLab, setSearchParams]);

  const closeForm = () => { setShowForm(false); setEditItem(null); setPendingLab(null); };

  const toggleMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { isActive: boolean } }) => employeesApi.update(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_saved')); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_deleted')); },
    onError: (error) => toast.showError(error),
  });

  const bulk = useBulkSelection();
  const [bulkBusy, setBulkBusy] = useState(false);
  const bulkDelete = async () => {
    const ids = [...bulk.selected];
    if (!confirm(t('admin.bulk_confirm_delete', { count: ids.length }))) return;
    setBulkBusy(true);
    const results = await Promise.allSettled(ids.map((id) => employeesApi.delete(id)));
    setBulkBusy(false);
    bulk.clear();
    qc.invalidateQueries({ queryKey: ['admin-employees'] });
    qc.invalidateQueries({ queryKey: ['employees'] });
    const failed = results.filter((r) => r.status === 'rejected').length;
    const done = ids.length - failed;
    if (failed === 0) toast.success(t('admin.bulk_delete_done', { count: done }));
    else toast.error(t('admin.bulk_delete_partial', { done, failed }));
  };

  const openEdit = (item: Employee) => {
    setEditItem(item);
    setShowForm(true);
  };

  /** Ishdan ketgan xodim O'CHIRILMAYDI — `isActive` olib tashlanadi. */
  const toggleActive = (item: Employee) =>
    toggleMutation.mutate({ id: item.id, values: { isActive: !item.isActive } });

  return (
    <>
      <Helmet><title>{t('admin.employees')} | Admin</title></Helmet>
      <div className="p-6">
        {showForm ? (
          <EmployeeForm
            key={editItem?.id ?? 'new'}
            employee={editItem}
            presetLabId={pendingLab ?? undefined}
            onClose={closeForm}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.employees')}</h1>
              <button onClick={() => { setEditItem(null); setPendingLab(null); setShowForm(true); }} className="btn-primary gap-2">
                <Plus className="h-4 w-4" /> {t('admin.add_new')}
              </button>
            </div>


            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <BulkActionsBar count={bulk.selected.size} onCancel={bulk.clear}>
                  <button
                    type="button"
                    onClick={() => void bulkDelete()}
                    disabled={bulkBusy}
                    className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 dark:!text-red-300 dark:!border-red-800 dark:hover:!bg-red-900/30 disabled:opacity-60"
                  >
                    {t('admin.bulk_delete')}
                  </button>
                </BulkActionsBar>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          aria-label={t('admin.select_all')}
                          checked={items.length > 0 && items.every((item) => bulk.selected.has(item.id))}
                          onChange={() => bulk.toggleAll(items.map((item) => item.id))}
                        />
                      </th>
                      <th className="text-left font-medium px-4 py-3">{t('adminC.employees.th_name')}</th>
                      <th className="text-left font-medium px-4 py-3">{t('adminC.employees.th_position')}</th>
                      <th className="text-left font-medium px-4 py-3">{t('adminC.employees.th_unit')}</th>
                      <th className="text-left font-medium px-4 py-3">{t('adminC.common.th_order')}</th>
                      <th className="text-right font-medium px-4 py-3">{t('adminC.common.th_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                          {t('adminC.employees.empty')}
                        </td>
                      </tr>
                    )}
                    {items.map((item) => (
                      <tr key={item.id} className={clsx('border-t border-gray-100 dark:border-gray-800', !item.isActive && 'opacity-50')}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`${t('admin.select_row')}: ${item.fullNameUz}`}
                            checked={bulk.selected.has(item.id)}
                            onChange={() => bulk.toggle(item.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {item.fullNameUz}
                          {item.isManagement && <span className="ml-2 text-xs text-accent-700 dark:text-accent-300">{t('adminC.employees.badge_management')}</span>}
                          {item.isUnitHead && <span className="ml-2 text-xs text-primary-600 dark:text-primary-300">{t('adminC.employees.badge_head')}</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.positionUz}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {units.find((unit) => unit.id === item.unitId)?.nameUz ?? '—'}
                          {item.labId && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {units.find((unit) => unit.id === item.labId)?.nameUz}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.order}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => toggleActive(item)}
                              title={item.isActive ? t('adminC.employees.deactivate') : t('adminC.employees.activate')}
                              className="p-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-300"
                            >
                              {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-300">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(item.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
