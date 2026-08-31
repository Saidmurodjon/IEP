import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { documentsApi, fileUrl } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUploadField from '@/components/admin/FileUploadField';
import LangTabs, { LANG_TABS, type LangSuffix } from '@/components/admin/LangTabs';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/date';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const schema = z.object({
  titleUz: z.string().min(1, 'Nomini kiriting'),
  titleEn: z.string().min(1, 'Nomini kiriting'),
  titleRu: z.string().min(1, 'Nomini kiriting'),
  descriptionUz: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionRu: z.string().optional(),
  fileKey: z.string().min(1, 'Fayl yuklang'),
  documentNumber: z.string().optional(),
  documentDate: z.string().optional(),
  category: z.string().optional(),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;
type DocumentItem = FormData & { id: string; isActive: boolean; order: number };

/**
 * `fileKey` ↔ ko'rinadigan manzil. Bazada YALANG'OCH kalit saqlanadi
 * (`Document.fileKey`), `FileUploadField` esa ko'rsatish/yuklash uchun
 * TO'LIQ manzil kutadi (`fileUrl()` — `lib/api.ts`, production'da API boshqa
 * domenda turadi).
 *
 * `toKey` eski nisbiy manzilni ham (`/api/files/<key>`, bu tuzatishdan oldin
 * yozilgan bo'lishi mumkin) to'g'ri o'qiydi — prefiksdan keyingi qismini,
 * qolgan manzildan qat'i nazar, kalit deb oladi.
 */
const toUrl = (key?: string | null) => (key ? fileUrl(key) : null);
const toKey = (url: string | null) => {
  if (!url) return '';
  const marker = '/api/files/';
  const index = url.indexOf(marker);
  return index === -1 ? url : url.slice(index + marker.length);
};

export default function AdminDocumentsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<DocumentItem | null>(null);
  const [activeTab, setActiveTab] = useState<LangSuffix>('Uz');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: () => documentsApi.list(true),
  });
  const items: DocumentItem[] = data?.data?.data ?? [];

  const {
    register, handleSubmit, reset, setValue, watch, getValues, formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const values = watch();

  const closeForm = () => { setShowForm(false); setEditItem(null); setActiveTab('Uz'); reset(); };


  // Ochiq oynada fokus qamalib turadi va `Escape` uni yopadi (10B2).

  const formRef = useRef<HTMLDivElement>(null);

  useFocusTrap(formRef, showForm, closeForm);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-documents'] });
    qc.invalidateQueries({ queryKey: ['documents'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => documentsApi.create(payload),
    onSuccess: () => { refresh(); toast.success(t('toast.document_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormData> }) =>
      documentsApi.update(id, payload),
    onSuccess: () => { refresh(); toast.success(t('toast.document_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => { refresh(); toast.success(t('toast.document_deleted')); },
    onError: (error) => toast.showError(error),
  });

  const openEdit = (item: DocumentItem) => {
    setEditItem(item);
    Object.entries(item).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      setValue(key as keyof FormData, value as never);
    });
    if (item.documentDate) {
      setValue('documentDate', new Date(item.documentDate).toISOString().slice(0, 10));
    }
    setShowForm(true);
  };

  const copyFromUz = () => {
    const current = getValues();
    setValue(`title${activeTab}` as keyof FormData, current.titleUz, { shouldDirty: true });
    setValue(`description${activeTab}` as keyof FormData, current.descriptionUz ?? '', { shouldDirty: true });
    toast.success(t('toast.copied_from_uz'));
  };

  const filled: Record<LangSuffix, boolean> = {
    Uz: !!values.titleUz, En: !!values.titleEn, Ru: !!values.titleRu,
  };

  const onSubmit = (payload: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, payload });
    else createMutation.mutate(payload);
  };

  return (
    <>
      <Helmet><title>{t('admin.documents')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.documents')}</h1>
          <button
            onClick={() => { reset({ isActive: true, order: 0 }); setEditItem(null); setShowForm(true); }}
            className="btn-primary gap-2"
          >
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
                <h2 id="admin-form-title" className="font-semibold text-gray-900">
                  {editItem ? t('admin.edit') : t('admin.add_new')} — {t('admin.documents')}
                </h2>
                <button onClick={closeForm} aria-label={t('common.close')} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                {/* Tarjima talab qilmaydigan maydonlar — bir marta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">{t('documents.number')}</label>
                    <input {...register('documentNumber')} className="input" placeholder="373-son" />
                  </div>
                  <div>
                    <label className="label">{t('documents.date')}</label>
                    <input type="date" {...register('documentDate')} className="input" />
                  </div>
                  <div>
                    <label className="label">Tartib raqami</label>
                    <input type="number" {...register('order')} className="input" defaultValue={0} />
                  </div>
                </div>

                <FileUploadField
                  kind="document"
                  label="Hujjat fayli *"
                  value={toUrl(values.fileKey)}
                  onChange={(url) => setValue('fileKey', toKey(url), { shouldDirty: true })}
                  ownerType="document"
                  ownerId={editItem?.id}
                />
                <input type="hidden" {...register('fileKey')} />
                {errors.fileKey && <p className="text-red-500 text-xs">{errors.fileKey.message}</p>}

                <div>
                  <LangTabs active={activeTab} onChange={setActiveTab} filled={filled} onCopyFromUz={copyFromUz} />
                  {LANG_TABS.map((tab) => (
                    <div key={tab.key} className={clsx('pt-4 space-y-3', activeTab === tab.key ? '' : 'hidden')}>
                      <div>
                        <label className="label">
                          Hujjat nomi ({tab.key.toUpperCase()}) <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`title${tab.key}` as keyof FormData)}
                          className={clsx('input', errors[`title${tab.key}` as keyof FormData] && 'border-red-400')}
                        />
                        {errors[`title${tab.key}` as keyof FormData] && (
                          <p className="text-red-500 text-xs mt-1">Hujjat nomini kiriting.</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Izoh ({tab.key.toUpperCase()})</label>
                        <textarea
                          {...register(`description${tab.key}` as keyof FormData)}
                          rows={3}
                          className="input resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('isActive')} defaultChecked className="rounded" />
                  Saytda ko'rsatilsin
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary"
                  >
                    {t('admin.save')}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary">
                    {t('admin.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nomi</th>
                  <th className="text-left font-medium px-4 py-3">Raqami</th>
                  <th className="text-left font-medium px-4 py-3">Sanasi</th>
                  <th className="text-right font-medium px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                      Hujjatlar hali kiritilmagan.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className={clsx('border-t border-gray-100', !item.isActive && 'opacity-50')}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.titleUz}</td>
                    <td className="px-4 py-3 text-gray-500">{item.documentNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.documentDate ? formatDate(item.documentDate) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            updateMutation.mutate({ id: item.id, payload: { isActive: !item.isActive } })
                          }
                          className="p-2 text-gray-400 hover:text-primary-700"
                        >
                          {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-primary-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(item.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
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
        )}
      </div>
    </>
  );
}
