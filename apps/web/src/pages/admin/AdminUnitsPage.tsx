import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeesApi, structureApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { Plus, Pencil, Trash2, Network } from 'lucide-react';
import clsx from 'clsx';
import AdminFormPage from '@/components/admin/AdminFormPage';

const schema = z.object({
  nameUz: z.string().min(1), nameEn: z.string().min(1), nameRu: z.string().min(1),
  descriptionUz: z.string().default(''),
  descriptionEn: z.string().default(''),
  descriptionRu: z.string().default(''),
  order: z.coerce.number().int().default(0),
});
type FormData = z.infer<typeof schema>;
type UnitItem = FormData & { id: string; type: string; children?: UnitItem[] };
/** Faqat bo'limlar; laboratoriyalar alohida sahifada (AdminLabsPage). */
type Kind = 'section';

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

  const { data, isLoading } = useQuery({ queryKey: ['structure-admin'], queryFn: () => structureApi.tree() });
  const { data: employeesData } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => employeesApi.list(undefined, true),
  });
  const employees: Employee[] = employeesData?.data?.data ?? [];

  // Eski turlar (department, center, ...) ham bo'limlar sahifasida ko'rsatiladi.
  const items = flattenTree(data?.data?.data ?? [])
    .filter((u) => u.type !== 'laboratory')
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

  const Icon = Network;
  const p = 'sections';

  const rows = (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((item) => {
        const staff = employees.filter((e) => e.unitId === item.id);
        return (
          <li key={item.id}>
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.nameUz}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('adminD.units.staff_count', { count: staff.length })}
                </p>
              </div>
              <button onClick={() => openEdit(item)} aria-label={t('admin.edit')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded transition-colors"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(item.id); }} aria-label={t('admin.delete')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        );
      })}
      {items.length === 0 && (
        <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          {t('adminD.units.empty')}
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
            title={editItem ? t('adminD.units.edit_title') : t('adminD.units.new_title')}
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
                <Plus className="h-4 w-4" /> {t('adminD.units.add_section')}
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
