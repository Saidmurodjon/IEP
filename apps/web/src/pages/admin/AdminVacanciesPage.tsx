import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Briefcase, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import type { Vacancy } from '@energetika/shared';
import { vacanciesApi, structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/Toast';
import AdminFormPage from '@/components/admin/AdminFormPage';
import RichTextEditor from '@/components/admin/RichTextEditor';
import LangTabs, { type LangSuffix } from '@/components/admin/LangTabs';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';
import { type Unit } from '@/lib/structure';
import { formatDate } from '@/lib/date';

const schema = z
  .object({
    titleUz: z.string().trim().min(1, 'adminC.vacancies.err_title'),
    titleEn: z.string().trim().min(1, 'adminC.vacancies.err_title'),
    titleRu: z.string().trim().min(1, 'adminC.vacancies.err_title'),
    descriptionUz: z.string(),
    descriptionEn: z.string(),
    descriptionRu: z.string(),
    unitId: z.string(),
    employmentType: z.enum(['full', 'part', 'contract']),
    // Maydonlar matn sifatida turadi: bo'sh qator — qiymat yo'q (null).
    salaryFrom: z.string(),
    salaryTo: z.string(),
    deadline: z.string(),
    contactEmail: z.string().email('adminC.vacancies.err_email').or(z.literal('')),
    contactPhone: z.string(),
    order: z.coerce.number().int(),
    isActive: z.boolean(),
  })
  .refine((v) => v.salaryFrom === '' || v.salaryTo === '' || Number(v.salaryFrom) <= Number(v.salaryTo), {
    path: ['salaryTo'],
    message: 'adminC.vacancies.err_salary',
  });
type FormData = z.infer<typeof schema>;

const EMPTY: FormData = {
  titleUz: '', titleEn: '', titleRu: '',
  descriptionUz: '', descriptionEn: '', descriptionRu: '',
  unitId: '', employmentType: 'full', salaryFrom: '', salaryTo: '',
  deadline: '', contactEmail: '', contactPhone: '', order: 0, isActive: true,
};

/** Daraxtni tekis ro'yxatga aylantiradi. */
function flatten(units: Unit[]): Unit[] {
  return units.flatMap((unit) => [unit, ...flatten(unit.children ?? [])]);
}

const toNumber = (v: string) => (v.trim() === '' ? null : Number(v));

/** Shakl qiymatlarini API tanasiga aylantiradi. */
function toPayload(v: FormData) {
  return {
    ...v,
    unitId: v.unitId || null,
    salaryFrom: toNumber(v.salaryFrom),
    salaryTo: toNumber(v.salaryTo),
    deadline: v.deadline || null,
    contactEmail: v.contactEmail || null,
    contactPhone: v.contactPhone.trim() || null,
  };
}

function toForm(item: Vacancy): FormData {
  return {
    titleUz: item.titleUz, titleEn: item.titleEn, titleRu: item.titleRu,
    descriptionUz: item.descriptionUz ?? '', descriptionEn: item.descriptionEn ?? '', descriptionRu: item.descriptionRu ?? '',
    unitId: item.unitId ?? '',
    employmentType: item.employmentType,
    salaryFrom: item.salaryFrom != null ? String(item.salaryFrom) : '',
    salaryTo: item.salaryTo != null ? String(item.salaryTo) : '',
    deadline: item.deadline ? item.deadline.slice(0, 10) : '',
    contactEmail: item.contactEmail ?? '',
    contactPhone: item.contactPhone ?? '',
    order: item.order,
    isActive: item.isActive,
  };
}

/** Muddat o'tganmi (kun oxirigacha amal qiladi). */
function isExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  const end = new Date(`${deadline.slice(0, 10)}T23:59:59`);
  return end.getTime() < Date.now();
}

function FieldError({ id, message }: { id: string; message?: string }) {
  const { t } = useTranslation();
  if (!message) return null;
  return <p id={id} role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{t(message)}</p>;
}

export default function AdminVacanciesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Vacancy | null>(null);
  const [tab, setTab] = useState<LangSuffix>('Uz');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vacancies'],
    queryFn: () => vacanciesApi.adminList(),
  });
  const items: Vacancy[] = data?.data?.data ?? [];

  const { data: structureData } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const units = flatten((structureData?.data?.data ?? []) as Unit[]);
  const sections = units.filter((u) => u.type === 'section');
  const labs = units.filter((u) => u.type === 'laboratory');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });
  const values = watch();

  const closeForm = () => { setShowForm(false); setEditItem(null); setTab('Uz'); reset(EMPTY); };
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-vacancies'] });
    qc.invalidateQueries({ queryKey: ['vacancies'] });
  };

  const createMutation = useMutation({
    mutationFn: (v: FormData) => vacanciesApi.create(toPayload(v)),
    onSuccess: () => { refresh(); toast.success(t('toast.vacancy_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => vacanciesApi.update(id, body),
    onSuccess: () => { refresh(); toast.success(t('toast.vacancy_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => vacanciesApi.update(id, { isActive }),
    onSuccess: () => refresh(),
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vacanciesApi.delete(id),
    onSuccess: () => { refresh(); toast.success(t('toast.vacancy_deleted')); },
    onError: (error) => toast.showError(error),
  });

  const bulk = useBulkSelection();
  const [bulkBusy, setBulkBusy] = useState(false);
  const bulkDelete = async () => {
    const ids = [...bulk.selected];
    if (!confirm(t('admin.bulk_confirm_delete', { count: ids.length }))) return;
    setBulkBusy(true);
    const results = await Promise.allSettled(ids.map((id) => vacanciesApi.delete(id)));
    setBulkBusy(false);
    bulk.clear();
    refresh();
    const failed = results.filter((r) => r.status === 'rejected').length;
    const done = ids.length - failed;
    if (failed === 0) toast.success(t('admin.bulk_delete_done', { count: done }));
    else toast.error(t('admin.bulk_delete_partial', { done, failed }));
  };

  const openNew = () => { reset(EMPTY); setEditItem(null); setTab('Uz'); setShowForm(true); };
  const openEdit = (item: Vacancy) => { reset(toForm(item)); setEditItem(item); setTab('Uz'); setShowForm(true); };

  const onSubmit = (v: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, body: toPayload(v) });
    else createMutation.mutate(v);
  };

  const filled: Record<LangSuffix, boolean> = {
    Uz: !!values.titleUz?.trim(), En: !!values.titleEn?.trim(), Ru: !!values.titleRu?.trim(),
  };
  const unitLabel = (u: Unit) => u.nameUz;

  return (
    <>
      <Helmet><title>{t('admin.vacancies')} | Admin</title></Helmet>
      <div className="p-6">
        {showForm ? (
          <AdminFormPage
            title={`${editItem ? t('admin.edit') : t('admin.add_new')} — ${t('admin.vacancies')}`}
            subtitle={t('admin.modal_subtitle')}
            icon={Briefcase}
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
            <LangTabs
              active={tab}
              onChange={setTab}
              filled={filled}
              onCopyFromUz={() => {
                setValue(`title${tab}`, values.titleUz, { shouldDirty: true });
                setValue(`description${tab}`, values.descriptionUz, { shouldDirty: true });
              }}
            />
            {(['Uz', 'En', 'Ru'] as const).map((suffix) => (
              <div key={suffix} className={clsx('space-y-4', tab !== suffix && 'hidden')}>
                <div>
                  <label htmlFor={`vac-title-${suffix}`} className="label">
                    {t('adminC.vacancies.title_label', { lang: suffix.toUpperCase() })}
                  </label>
                  <input
                    id={`vac-title-${suffix}`}
                    {...register(`title${suffix}`)}
                    className="input"
                    aria-invalid={!!errors[`title${suffix}`]}
                    aria-describedby={errors[`title${suffix}`] ? `vac-title-${suffix}-err` : undefined}
                  />
                  <FieldError id={`vac-title-${suffix}-err`} message={errors[`title${suffix}`]?.message} />
                </div>
                <div>
                  <p className="label">{t('adminC.vacancies.desc_label', { lang: suffix.toUpperCase() })}</p>
                  <RichTextEditor
                    value={values[`description${suffix}`] ?? ''}
                    onChange={(html) => setValue(`description${suffix}`, html, { shouldDirty: true })}
                    ownerType="vacancy"
                    ownerId={editItem?.id}
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="vac-unit" className="label">{t('adminC.vacancies.unit')}</label>
                <select id="vac-unit" {...register('unitId')} className="input">
                  <option value="">{t('adminC.vacancies.unit_none')}</option>
                  {sections.length > 0 && (
                    <optgroup label={t('adminC.vacancies.unit_sections')}>
                      {sections.map((u) => <option key={u.id} value={u.id}>{unitLabel(u)}</option>)}
                    </optgroup>
                  )}
                  {labs.length > 0 && (
                    <optgroup label={t('adminC.vacancies.unit_labs')}>
                      {labs.map((u) => <option key={u.id} value={u.id}>{unitLabel(u)}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="vac-type" className="label">{t('adminC.vacancies.type')}</label>
                <select id="vac-type" {...register('employmentType')} className="input">
                  {(['full', 'part', 'contract'] as const).map((k) => (
                    <option key={k} value={k}>{t(`vacancies.type_${k}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vac-sal-from" className="label">{t('adminC.vacancies.salary_from')}</label>
                <input id="vac-sal-from" type="number" min={0} step={1} {...register('salaryFrom')} className="input" />
              </div>
              <div>
                <label htmlFor="vac-sal-to" className="label">{t('adminC.vacancies.salary_to')}</label>
                <input
                  id="vac-sal-to"
                  type="number"
                  min={0}
                  step={1}
                  {...register('salaryTo')}
                  className="input"
                  aria-invalid={!!errors.salaryTo}
                  aria-describedby={errors.salaryTo ? 'vac-sal-to-err' : undefined}
                />
                <FieldError id="vac-sal-to-err" message={errors.salaryTo?.message} />
              </div>
              <div>
                <label htmlFor="vac-deadline" className="label">{t('adminC.vacancies.deadline')}</label>
                <input id="vac-deadline" type="date" {...register('deadline')} className="input" />
              </div>
              <div>
                <label htmlFor="vac-order" className="label">{t('adminC.common.order_number')}</label>
                <input id="vac-order" type="number" {...register('order')} className="input" />
              </div>
              <div>
                <label htmlFor="vac-email" className="label">{t('adminC.vacancies.email')}</label>
                <input
                  id="vac-email"
                  type="email"
                  {...register('contactEmail')}
                  className="input"
                  aria-invalid={!!errors.contactEmail}
                  aria-describedby={errors.contactEmail ? 'vac-email-err vac-contact-hint' : 'vac-contact-hint'}
                />
                <FieldError id="vac-email-err" message={errors.contactEmail?.message} />
              </div>
              <div>
                <label htmlFor="vac-phone" className="label">{t('adminC.vacancies.phone')}</label>
                <input id="vac-phone" type="tel" {...register('contactPhone')} className="input" aria-describedby="vac-contact-hint" />
              </div>
            </div>
            <p id="vac-contact-hint" className="text-xs text-gray-500 dark:text-gray-400">{t('adminC.vacancies.contact_hint')}</p>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              {t('adminC.common.show_on_site')}
            </label>
          </AdminFormPage>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.vacancies')}</h1>
              <button onClick={openNew} className="btn-primary gap-2">
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
                        <th className="text-left font-medium px-4 py-3">{t('adminC.vacancies.th_title')}</th>
                        <th className="text-left font-medium px-4 py-3">{t('adminC.vacancies.th_unit')}</th>
                        <th className="text-left font-medium px-4 py-3">{t('adminC.vacancies.th_deadline')}</th>
                        <th className="text-right font-medium px-4 py-3">{t('adminC.common.th_actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                            {t('adminC.vacancies.empty')}
                          </td>
                        </tr>
                      )}
                      {items.map((item) => (
                        <tr key={item.id} className={clsx('border-t border-gray-100 dark:border-gray-800', !item.isActive && 'opacity-50')}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              aria-label={`${t('admin.select_row')}: ${item.titleUz}`}
                              checked={bulk.selected.has(item.id)}
                              onChange={() => bulk.toggle(item.id)}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {item.titleUz}
                            {!item.isActive && (
                              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">({t('adminC.vacancies.hidden')})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.unit?.nameUz ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.deadline ? formatDate(item.deadline) : '—'}
                            {isExpired(item.deadline) && (
                              <span className="ml-2 inline-block rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 text-xs px-2 py-0.5">
                                {t('adminC.vacancies.expired')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                                title={item.isActive ? t('adminC.common.hide') : t('adminC.common.show')}
                                aria-label={item.isActive ? t('adminC.common.hide') : t('adminC.common.show')}
                                className="p-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-300"
                              >
                                {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openEdit(item)}
                                aria-label={t('admin.edit')}
                                className="p-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-300"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(item.id);
                                }}
                                aria-label={t('admin.delete')}
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
