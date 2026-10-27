import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Users, EyeOff, Eye } from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Employee } from '@/lib/employee';
import { type Unit } from '@/lib/structure';
import FileUploadField from '@/components/admin/FileUploadField';
import { useToast } from '@/components/Toast';
import AdminFormPage from '@/components/admin/AdminFormPage';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';

const schema = z.object({
  fullNameUz: z.string().min(1, 'adminC.employees.err_name'),
  fullNameEn: z.string().min(1, 'adminC.employees.err_name'),
  fullNameRu: z.string().min(1, 'adminC.employees.err_name'),
  positionUz: z.string().min(1, 'adminC.employees.err_position'),
  positionEn: z.string().min(1, 'adminC.employees.err_position'),
  positionRu: z.string().min(1, 'adminC.employees.err_position'),
  degreeUz: z.string().optional(), degreeEn: z.string().optional(), degreeRu: z.string().optional(),
  titleUz: z.string().optional(), titleEn: z.string().optional(), titleRu: z.string().optional(),
  researchAreaUz: z.string().optional(), researchAreaEn: z.string().optional(), researchAreaRu: z.string().optional(),
  receptionHoursUz: z.string().optional(), receptionHoursEn: z.string().optional(), receptionHoursRu: z.string().optional(),
  email: z.string().email('adminC.employees.err_email').optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  orcid: z.string().optional(),
  scopusId: z.string().optional(),
  officeRoom: z.string().optional(),
  unitId: z.string().optional(),
  order: z.coerce.number().int().optional(),
  isManagement: z.boolean().optional(),
  isUnitHead: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const TABS = [
  { key: 'Uz', label: "O'zbek" },
  { key: 'En', label: 'English' },
  { key: 'Ru', label: 'Русский' },
] as const;

/** Daraxtni tekis ro'yxatga aylantiradi — biriktirish uchun ro'yxat. */
function flatten(units: Unit[], depth = 0): Array<{ unit: Unit; depth: number }> {
  return units.flatMap((unit) => [{ unit, depth }, ...flatten(unit.children ?? [], depth + 1)]);
}

export default function AdminEmployeesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'Uz' | 'En' | 'Ru'>('Uz');
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
  const units = flatten((structureData?.data?.data ?? []) as Unit[]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const photoUrl = watch('photoUrl');

  const closeForm = () => { setShowForm(false); setEditItem(null); setActiveTab('Uz'); reset(); };

  const createMutation = useMutation({
    mutationFn: (values: FormData) => employeesApi.create(values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<FormData> }) => employeesApi.update(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_saved')); closeForm(); },
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
    Object.entries(item).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      setValue(key as keyof FormData, value as never);
    });
    setShowForm(true);
  };

  /** Ishdan ketgan xodim O'CHIRILMAYDI — `isActive` olib tashlanadi. */
  const toggleActive = (item: Employee) =>
    updateMutation.mutate({ id: item.id, values: { isActive: !item.isActive } });

  const onSubmit = (values: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, values });
    else createMutation.mutate(values);
  };

  return (
    <>
      <Helmet><title>{t('admin.employees')} | Admin</title></Helmet>
      <div className="p-6">
        {showForm ? (
          <AdminFormPage
            title={`${editItem ? t('admin.edit') : t('admin.add_new')} — ${t('admin.employees')}`}
            subtitle={t('admin.modal_subtitle')}
            icon={Users}
            size="lg"
            onClose={closeForm}
            onSubmit={handleSubmit(onSubmit)}
            footer={
              <>
                <button type="button" onClick={closeForm} className="btn-secondary sm:mr-auto">
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {t('admin.save')}
                </button>
              </>
            }
          >
            <div className="flex gap-1 border-b dark:border-gray-800">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-700 dark:border-primary-300 dark:text-primary-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {TABS.map((tab) => (
              <div key={tab.key} className={clsx('space-y-3', activeTab === tab.key ? '' : 'hidden')}>
                <div>
                  <label className="label">{t('adminC.employees.fullname_label', { lang: tab.key.toUpperCase() })}</label>
                  <input {...register(`fullName${tab.key}` as keyof FormData)} className="input" />
                  {errors[`fullName${tab.key}` as keyof FormData] && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {t(errors[`fullName${tab.key}` as keyof FormData]?.message as string)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">{t('adminC.employees.position_label', { lang: tab.key.toUpperCase() })}</label>
                  <input {...register(`position${tab.key}` as keyof FormData)} className="input" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('adminC.employees.degree_label', { lang: tab.key.toUpperCase() })}</label>
                    <input {...register(`degree${tab.key}` as keyof FormData)} className="input" />
                  </div>
                  <div>
                    <label className="label">{t('adminC.employees.title_label', { lang: tab.key.toUpperCase() })}</label>
                    <input {...register(`title${tab.key}` as keyof FormData)} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">{t('adminC.employees.research_label', { lang: tab.key.toUpperCase() })}</label>
                  <input {...register(`researchArea${tab.key}` as keyof FormData)} className="input" />
                </div>
                <div>
                  <label className="label">{t('adminC.employees.reception_label', { lang: tab.key.toUpperCase() })}</label>
                  <input
                    {...register(`receptionHours${tab.key}` as keyof FormData)}
                    className="input"
                    placeholder={t('adminC.employees.reception_placeholder')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminC.employees.reception_hint')}
                  </p>
                </div>
              </div>
            ))}

            {/*
              Shaxsiy ma'lumotlar bo'yicha ogohlantirish — 06-topshiriq talabi.
            */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/30 p-4 space-y-3">
              <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                <span className="font-semibold">{t('adminC.common.attention')}</span> {t('adminC.employees.warn_before')}{' '}
                <span className="font-semibold">{t('adminC.employees.warn_bold')}</span>{' '}
                {t('adminC.employees.warn_after')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">{t('adminC.employees.phone')}</label>
                  <input {...register('phone')} className="input" placeholder="+998 71 ..." />
                </div>
                <div>
                  <label className="label">{t('adminC.employees.email')}</label>
                  <input {...register('email')} className="input" placeholder="ism@iep.uz" />
                  {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{t(errors.email.message as string)}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">{t('adminC.employees.office')}</label>
                <input {...register('officeRoom')} className="input" />
              </div>
              <div className="sm:col-span-2">
                <FileUploadField
                  kind="photo"
                  label={t('adminC.employees.photo')}
                  value={photoUrl ?? null}
                  onChange={(url) => setValue('photoUrl', url ?? '', { shouldDirty: true })}
                  ownerType="employee"
                  ownerId={editItem?.id}
                />
              </div>
              <div>
                <label className="label">ORCID</label>
                <input {...register('orcid')} className="input" placeholder="0000-0000-0000-0000" />
              </div>
              <div>
                <label className="label">Scopus Author ID</label>
                <input {...register('scopusId')} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">{t('adminC.employees.unit')}</label>
                <select {...register('unitId')} className="input">
                  <option value="">{t('adminC.employees.unit_none')}</option>
                  {units.map(({ unit, depth }) => (
                    <option key={unit.id} value={unit.id}>
                      {' '.repeat(depth * 3)}{unit.nameUz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('adminC.common.order_number')}</label>
                <input type="number" {...register('order')} className="input" defaultValue={0} />
              </div>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('isManagement')} className="rounded" />
                {t('adminC.employees.is_management')}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('isUnitHead')} className="rounded" />
                {t('adminC.employees.is_unit_head')}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register('isActive')} defaultChecked className="rounded" />
                {t('adminC.employees.active')}
              </label>
            </div>
          </AdminFormPage>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.employees')}</h1>
              <button onClick={() => { reset(); setEditItem(null); setShowForm(true); }} className="btn-primary gap-2">
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
                          {units.find(({ unit }) => unit.id === item.unitId)?.unit.nameUz ?? '—'}
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
