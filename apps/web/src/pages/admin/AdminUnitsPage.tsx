import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeesApi, structureApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { Plus, Pencil, Trash2, Network, FlaskConical, Users, X, UserPlus } from 'lucide-react';
import clsx from 'clsx';
import AdminFormPage from '@/components/admin/AdminFormPage';
import { useToast } from '@/components/Toast';

const schema = z.object({
  nameUz: z.string().min(1), nameEn: z.string().min(1), nameRu: z.string().min(1),
  descriptionUz: z.string().default(''),
  descriptionEn: z.string().default(''),
  descriptionRu: z.string().default(''),
  order: z.coerce.number().int().default(0),
});
type FormData = z.infer<typeof schema>;
type UnitItem = FormData & { id: string; type: string; children?: UnitItem[] };
/** Bo'lim va laboratoriya — alohida qismlar, har biri o'z sahifasida. */
type Kind = 'section' | 'laboratory';

const EMPTY: FormData = { nameUz: '', nameEn: '', nameRu: '', descriptionUz: '', descriptionEn: '', descriptionRu: '', order: 0 };
const TABS = [{ key: 'uz', label: "O'zbek" }, { key: 'en', label: 'English' }, { key: 'ru', label: 'Русский' }] as const;

function flattenTree(units: UnitItem[]): UnitItem[] {
  const result: UnitItem[] = [];
  for (const u of units) {
    result.push(u);
    if (u.children) result.push(...flattenTree(u.children));
  }
  return result;
}

export default function AdminUnitsPage({ kind }: { kind: Kind }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<UnitItem | null>(null);
  const [activeTab, setActiveTab] = useState<'uz' | 'en' | 'ru'>('uz');
  const [openLab, setOpenLab] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['structure-admin'], queryFn: () => structureApi.tree() });
  const { data: employeesData } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => employeesApi.list(undefined, true),
  });
  const employees: Employee[] = employeesData?.data?.data ?? [];

  const isLab = kind === 'laboratory';
  // Eski turlar (department, center, ...) bo'limlar sahifasida ko'rsatiladi.
  const items = flattenTree(data?.data?.data ?? [])
    .filter((u) => (u.type === 'laboratory') === isLab)
    .sort((a, b) => a.order - b.order);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['structure-admin'] });
    qc.invalidateQueries({ queryKey: ['structure'] });
  };
  const createMut = useMutation({ mutationFn: (d: FormData & { type: Kind; parentId: null }) => structureApi.create(d), onSuccess: () => { invalidate(); closeForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: FormData }) => structureApi.update(id, data), onSuccess: () => { invalidate(); closeForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => structureApi.delete(id), onSuccess: invalidate });

  const closeForm = () => { setShowForm(false); setEditItem(null); setActiveTab('uz'); reset(EMPTY); };

  const openNew = () => { reset(EMPTY); setEditItem(null); setShowForm(true); };

  const openEdit = (item: UnitItem) => {
    setEditItem(item);
    reset({
      nameUz: item.nameUz, nameEn: item.nameEn, nameRu: item.nameRu,
      descriptionUz: item.descriptionUz ?? '', descriptionEn: item.descriptionEn ?? '', descriptionRu: item.descriptionRu ?? '',
      order: item.order,
    });
    setShowForm(true);
  };

  const onSubmit = (values: FormData) => {
    // Tur shakldan emas, sahifadan olinadi; tahrirda tur o'zgarmaydi.
    if (editItem) updateMut.mutate({ id: editItem.id, data: values });
    else createMut.mutate({ ...values, type: kind, parentId: null });
  };

  const Icon = isLab ? FlaskConical : Network;
  const p = isLab ? 'labs' : 'sections';

  const rows = (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((item) => {
        const staff = employees.filter((e) => (isLab ? e.labId : e.unitId) === item.id);
        const expanded = isLab && openLab === item.id;
        return (
          <li key={item.id}>
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.nameUz}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('adminD.units.staff_count', { count: staff.length })}
                </p>
              </div>
              {isLab && (
                <button
                  type="button"
                  onClick={() => setOpenLab(expanded ? null : item.id)}
                  aria-expanded={expanded}
                  aria-controls={`lab-staff-${item.id}`}
                  className="btn-secondary gap-1.5 !px-3 !py-1.5 text-xs"
                >
                  <Users className="h-4 w-4" aria-hidden="true" /> {t('adminD.units.lab_staff')}
                </button>
              )}
              <button onClick={() => openEdit(item)} aria-label={t('admin.edit')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded transition-colors"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(item.id); }} aria-label={t('admin.delete')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
            {expanded && <LabStaffPanel lab={item} employees={employees} />}
          </li>
        );
      })}
      {items.length === 0 && (
        <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          {t(isLab ? 'adminD.units.empty_labs' : 'adminD.units.empty')}
        </li>
      )}
    </ul>
  );

  return (
    <>
      <Helmet><title>{t(`admin.${p}`)} | Admin</title></Helmet>
      <div className="p-6">
        {showForm ? (
          <AdminFormPage
            title={editItem ? t('adminD.units.edit_title') : t(isLab ? 'adminD.units.new_lab_title' : 'adminD.units.new_title')}
            subtitle={t('admin.modal_subtitle')}
            icon={Icon}
            size="md"
            onClose={closeForm}
            onSubmit={handleSubmit(onSubmit)}
            footer={
              <>
                <button type="button" onClick={closeForm} className="btn-secondary sm:mr-auto">{t('admin.cancel')}</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary">{t('admin.save')}</button>
              </>
            }
          >
            <div className="flex gap-1 border-b mb-4">
              {TABS.map((tab) => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.key ? 'border-primary-600 text-primary-700 dark:text-primary-300' : 'border-transparent text-gray-500 dark:text-gray-400')}>
                  {tab.label}
                </button>
              ))}
            </div>

            {TABS.map((tab) => (
              <div key={tab.key} className={activeTab === tab.key ? 'space-y-3' : 'hidden'}>
                <div>
                  <label className="label">{t('adminD.units.name_lang', { lang: tab.key.toUpperCase() })}</label>
                  <input {...register(`name${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} className="input" />
                </div>
                <div>
                  <label className="label">{t('adminD.units.description_lang', { lang: tab.key.toUpperCase() })}</label>
                  <textarea {...register(`description${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} rows={2} className="input resize-none" />
                </div>
              </div>
            ))}

            <div className="max-w-[12rem]">
              <label htmlFor="unit-order" className="label">{t('adminD.units.order')}</label>
              <input id="unit-order" {...register('order')} type="number" className="input" />
            </div>
          </AdminFormPage>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <Icon className="h-6 w-6" aria-hidden="true" /> {t(`admin.${p}`)}
              </h1>
              <button onClick={openNew} className="btn-primary gap-2">
                <Plus className="h-4 w-4" /> {t(isLab ? 'adminD.units.add_lab' : 'adminD.units.add_section')}
              </button>
            </div>
            {isLoading
              ? <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
              : <div className="card overflow-hidden">{rows}</div>}
          </>
        )}
      </div>
    </>
  );
}

/**
 * Laboratoriya xodimlari: mavjud xodimni biriktirish, laboratoriyadan chiqarish
 * yoki shu laboratoriya uchun yangi xodim qo'shish. Xodim o'chirilmaydi —
 * faqat `labId` o'zgaradi.
 */
function LabStaffPanel({ lab, employees }: { lab: UnitItem; employees: Employee[] }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [pick, setPick] = useState('');

  const staff = employees.filter((e) => e.labId === lab.id);
  const others = employees.filter((e) => e.labId !== lab.id);

  const assignMut = useMutation({
    mutationFn: ({ id, labId }: { id: string; labId: string }) => employeesApi.update(id, { labId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-employees'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success(t('toast.employee_saved'));
      setPick('');
    },
    onError: (error) => toast.showError(error),
  });

  const selectId = `lab-attach-${lab.id}`;

  return (
    <div id={`lab-staff-${lab.id}`} className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-4">
      <ul className="space-y-2" aria-live="polite">
        {staff.map((e) => (
          <li key={e.id} className={clsx('flex items-center gap-3 text-sm', !e.isActive && 'opacity-50')}>
            <span className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">{e.fullNameUz}</span>
              <span className="text-gray-500 dark:text-gray-400"> — {e.positionUz}</span>
            </span>
            <button
              type="button"
              onClick={() => assignMut.mutate({ id: e.id, labId: '' })}
              disabled={assignMut.isPending}
              aria-label={`${t('adminD.units.detach')}: ${e.fullNameUz}`}
              title={t('adminD.units.detach')}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
        {staff.length === 0 && <li className="text-sm text-gray-500 dark:text-gray-400">{t('adminD.units.no_lab_staff')}</li>}
      </ul>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[14rem]">
          <label htmlFor={selectId} className="label">{t('adminD.units.attach_label')}</label>
          <select id={selectId} value={pick} onChange={(ev) => setPick(ev.target.value)} className="input">
            <option value="">{t('adminD.units.attach_none')}</option>
            {others.map((e) => (
              <option key={e.id} value={e.id}>{e.fullNameUz} — {e.positionUz}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => pick && assignMut.mutate({ id: pick, labId: lab.id })}
          disabled={!pick || assignMut.isPending}
          className="btn-primary"
        >
          {t('adminD.units.attach_btn')}
        </button>
        <Link to={`/admin/employees?labId=${lab.id}`} className="btn-secondary gap-1.5">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> {t('adminD.units.new_employee')}
        </Link>
      </div>
    </div>
  );
}
