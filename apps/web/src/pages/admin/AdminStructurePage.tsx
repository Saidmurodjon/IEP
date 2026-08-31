import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { structureApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const schema = z.object({
  nameUz: z.string().min(1), nameEn: z.string().min(1), nameRu: z.string().min(1),
  descriptionUz: z.string().default(''),
  descriptionEn: z.string().default(''),
  descriptionRu: z.string().default(''),
  head: z.string().optional(),
  type: z.enum(['department', 'laboratory', 'division', 'center', 'sector']),
  order: z.coerce.number().int().default(0),
  parentId: z.string().optional().nullable(),
});
type FormData = z.infer<typeof schema>;
type UnitItem = FormData & { id: string; children?: UnitItem[] };

const UNIT_TYPES = ['department', 'laboratory', 'division', 'center', 'sector'];
const TABS = [{ key: 'uz', label: "O'zbek" }, { key: 'en', label: 'English' }, { key: 'ru', label: 'Русский' }] as const;

function flattenTree(units: UnitItem[]): UnitItem[] {
  const result: UnitItem[] = [];
  for (const u of units) {
    result.push(u);
    if (u.children) result.push(...flattenTree(u.children));
  }
  return result;
}

export default function AdminStructurePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<UnitItem | null>(null);
  const [activeTab, setActiveTab] = useState<'uz' | 'en' | 'ru'>('uz');

  const { data, isLoading } = useQuery({ queryKey: ['structure-admin'], queryFn: () => structureApi.tree() });
  const tree: UnitItem[] = data?.data?.data ?? [];
  const flat = flattenTree(tree);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'department', order: 0, descriptionUz: '', descriptionEn: '', descriptionRu: '' },
  });

  const createMut = useMutation({ mutationFn: (d: FormData) => structureApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['structure-admin'] }); qc.invalidateQueries({ queryKey: ['structure'] }); closeForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) => structureApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['structure-admin'] }); qc.invalidateQueries({ queryKey: ['structure'] }); closeForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => structureApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['structure-admin'] }); qc.invalidateQueries({ queryKey: ['structure'] }); } });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset({ type: 'department', order: 0, descriptionUz: '', descriptionEn: '', descriptionRu: '' }); };


  // Ochiq oynada fokus qamalib turadi va `Escape` uni yopadi (10B2).

  const formRef = useRef<HTMLDivElement>(null);

  useFocusTrap(formRef, showForm, closeForm);

  const openEdit = (item: UnitItem) => {
    setEditItem(item);
    (Object.keys(schema.shape) as (keyof FormData)[]).forEach((k) => {
      setValue(k, (item as Record<string, unknown>)[k] as string & number);
    });
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (!data.parentId) data.parentId = null;
    if (editItem) updateMut.mutate({ id: editItem.id, data });
    else createMut.mutate(data);
  };

  return (
    <>
      <Helmet><title>Tuzilma | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.structure')}</h1>
          <button onClick={() => { reset({ type: 'department', order: 0, descriptionUz: '', descriptionEn: '', descriptionRu: '' }); setShowForm(true); }} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> {t('admin.add_new')}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-2xl w-full max-w-xl my-4"
              ref={formRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-form-title"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 id="admin-form-title" className="font-semibold text-gray-900">{editItem ? 'Tahrirlash' : 'Yangi bo\'lim'}</h2>
                <button onClick={closeForm} aria-label={t('common.close')} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div className="flex gap-1 border-b mb-4">
                  {TABS.map((tab) => (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                      className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                        activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500')}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {TABS.map((tab) => (
                  <div key={tab.key} className={activeTab === tab.key ? 'space-y-3' : 'hidden'}>
                    <div>
                      <label className="label">Nomi ({tab.key.toUpperCase()})</label>
                      <input {...register(`name${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} className="input" />
                    </div>
                    <div>
                      <label className="label">Tavsif ({tab.key.toUpperCase()})</label>
                      <textarea {...register(`description${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} rows={2} className="input resize-none" />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tur</label>
                    <select {...register('type')} className="input">
                      {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tartib</label>
                    <input {...register('order')} type="number" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Rahbar</label>
                    <input {...register('head')} className="input" placeholder="F.I.O." />
                  </div>
                  <div>
                    <label className="label">Yuqori bo'lim</label>
                    <select {...register('parentId')} className="input">
                      <option value="">— Asosiy —</option>
                      {flat.filter((u) => u.id !== editItem?.id).map((u) => (
                        <option key={u.id} value={u.id}>{u.nameUz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary">{t('admin.save')}</button>
                  <button type="button" onClick={closeForm} className="btn-secondary">{t('admin.cancel')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nomi</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Tur</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Rahbar</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flat.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nameUz}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.type}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.head ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(item.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {flat.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Bo'limlar yo'q</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
