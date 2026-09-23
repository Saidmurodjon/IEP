import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pubsApi, fileUrl } from '@/lib/api';
import { Plus, Pencil, Trash2, X, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import FileUploadField from '@/components/admin/FileUploadField';
import { useToast } from '@/components/Toast';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';

const schema = z.object({
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  authors: z.string().min(1),
  journal: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  doi: z.string().optional(),
  fileUrl: z.string().optional(),
  category: z.enum(['article', 'monograph', 'conference', 'patent', 'report']),
});
type FormData = z.infer<typeof schema>;
type PubItem = FormData & { id: string };

const TABS = [
  { key: 'uz', label: "O'zbek" },
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
] as const;

const CATS = ['article', 'monograph', 'conference', 'patent', 'report'] as const;

export default function AdminPublicationsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PubItem | null>(null);
  const [activeTab, setActiveTab] = useState<'uz' | 'en' | 'ru'>('uz');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pubs-list'],
    queryFn: () => pubsApi.list(1, 100),
  });

  const items: PubItem[] = data?.data?.data ?? [];

  const toast = useToast();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'article', year: new Date().getFullYear() },
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) => pubsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pubs-list'] }); qc.invalidateQueries({ queryKey: ['publications'] }); toast.success(t('toast.publication_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) => pubsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pubs-list'] }); qc.invalidateQueries({ queryKey: ['publications'] }); toast.success(t('toast.publication_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => pubsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pubs-list'] });
      qc.invalidateQueries({ queryKey: ['publications'] });
      toast.success(t('toast.publication_deleted'));
    },
    onError: (error) => toast.showError(error),
  });

  const bulk = useBulkSelection();
  const [bulkBusy, setBulkBusy] = useState(false);
  const bulkDelete = async () => {
    const ids = [...bulk.selected];
    if (!confirm(t('admin.bulk_confirm_delete', { count: ids.length }))) return;
    setBulkBusy(true);
    const results = await Promise.allSettled(ids.map((id) => pubsApi.delete(id)));
    setBulkBusy(false);
    bulk.clear();
    qc.invalidateQueries({ queryKey: ['admin-pubs-list'] });
    qc.invalidateQueries({ queryKey: ['publications'] });
    const failed = results.filter((r) => r.status === 'rejected').length;
    const done = ids.length - failed;
    if (failed === 0) toast.success(t('admin.bulk_delete_done', { count: done }));
    else toast.error(t('admin.bulk_delete_partial', { done, failed }));
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); reset({ category: 'article', year: new Date().getFullYear() }); };


  // Ochiq oynada fokus qamalib turadi va `Escape` uni yopadi (10B2).

  const formRef = useRef<HTMLDivElement>(null);

  useFocusTrap(formRef, showForm, closeForm);

  const openEdit = (item: PubItem) => {
    setEditItem(item);
    Object.entries(item).forEach(([k, v]) => setValue(k as keyof FormData, v as string & number));
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, data });
    else createMutation.mutate(data);
  };

  return (
    <>
      <Helmet><title>Nashrlar | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.publications')}</h1>
          <button onClick={() => { reset({ category: 'article', year: new Date().getFullYear() }); setShowForm(true); }} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> {t('admin.add_new')}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-2xl w-full max-w-2xl my-4"
              ref={formRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-form-title"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 id="admin-form-title" className="font-semibold text-gray-900">{editItem ? t('admin.edit') : t('admin.add_new')} — Nashr</h2>
                <button onClick={closeForm} aria-label={t('common.close')} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                {/* Language tabs */}
                <div className="flex gap-1 border-b mb-4">
                  {TABS.map((tab) => (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                      className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                        activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {TABS.map((tab) => (
                  <div key={tab.key} className={activeTab === tab.key ? '' : 'hidden'}>
                    <label className="label">{t(`admin.title_${tab.key}`)}</label>
                    <input {...register(`title${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} className="input" />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Mualliflar</label>
                    <input {...register('authors')} className="input" placeholder="Familiya I.I., ..." />
                    {errors.authors && <p className="text-red-500 text-xs mt-1">{errors.authors.message}</p>}
                  </div>
                  <div>
                    <label className="label">Yil</label>
                    <input {...register('year')} type="number" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Jurnal</label>
                    <input {...register('journal')} className="input" />
                  </div>
                  <div>
                    <label className="label">Kategoriya</label>
                    <select {...register('category')} className="input">
                      {CATS.map((c) => <option key={c} value={c}>{t(`publications.${c}`)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">DOI</label>
                    <input {...register('doi')} className="input" placeholder="10.xxxx/..." />
                  </div>
                </div>

                {/*
                  Server `fileUrl` ni TO'LIQ manzil deb talab qiladi
                  (`z.string().url()`), yuklash javobi esa nisbiy manzil
                  qaytaradi (`/api/files/<key>`) — shuning uchun saqlashdan
                  oldin `fileUrl()` orqali to'liqlantiriladi (`lib/api.ts`).
                */}
                <FileUploadField
                  kind="document"
                  label="Nashr fayli (PDF, DOC, XLS)"
                  value={watch('fileUrl') ? fileUrl(watch('fileUrl')) : null}
                  onChange={(url) => setValue('fileUrl', url ? fileUrl(url) : '', { shouldDirty: true })}
                  ownerType="publication"
                  ownerId={editItem?.id}
                />

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">{t('admin.save')}</button>
                  <button type="button" onClick={closeForm} className="btn-secondary">{t('admin.cancel')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div> : (
          <>
            <BulkActionsBar count={bulk.selected.size} onCancel={bulk.clear}>
              <button
                type="button"
                onClick={() => void bulkDelete()}
                disabled={bulkBusy}
                className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 disabled:opacity-60"
              >
                {t('admin.bulk_delete')}
              </button>
            </BulkActionsBar>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label={t('admin.select_all')}
                      checked={items.length > 0 && items.every((item) => bulk.selected.has(item.id))}
                      onChange={() => bulk.toggleAll(items.map((item) => item.id))}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Sarlavha</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Mualliflar</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Yil</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`${t('admin.select_row')}: ${item.titleUz}`}
                        checked={bulk.selected.has(item.id)}
                        onChange={() => bulk.toggle(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        <span className="truncate max-w-xs font-medium text-gray-900">{item.titleUz}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell truncate max-w-xs">{item.authors}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.year}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(item.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nashrlar yo'q</td></tr>}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </>
  );
}
