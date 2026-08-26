import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { partnersApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const schema = z.object({
  nameUz: z.string().min(1, 'Nomini kiriting'),
  nameEn: z.string().min(1, 'Nomini kiriting'),
  nameRu: z.string().min(1, 'Nomini kiriting'),
  logoUrl: z.string().min(1, 'Logotip manzilini kiriting'),
  websiteUrl: z.string().url("Havola noto'g'ri").optional().or(z.literal('')),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;
type Partner = FormData & { id: string; isActive: boolean; order: number };

export default function AdminPartnersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Partner | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => partnersApi.list(true),
  });
  const items: Partner[] = data?.data?.data ?? [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-partners'] });
    qc.invalidateQueries({ queryKey: ['partners'] });
  };

  const createMutation = useMutation({
    mutationFn: (values: FormData) => partnersApi.create(values),
    onSuccess: () => { refresh(); closeForm(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<FormData> }) => partnersApi.update(id, values),
    onSuccess: () => { refresh(); closeForm(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: refresh,
  });

  const openEdit = (item: Partner) => {
    setEditItem(item);
    Object.entries(item).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      setValue(key as keyof FormData, value as never);
    });
    setShowForm(true);
  };

  const onSubmit = (values: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, values });
    else createMutation.mutate(values);
  };

  return (
    <>
      <Helmet><title>{t('admin.partners')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.partners')}</h1>
          <button onClick={() => { reset(); setEditItem(null); setShowForm(true); }} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> {t('admin.add_new')}
          </button>
        </div>

        {/*
          Hamkor logotipi — tashkilotning savdo belgisi. Faqat institut bilan
          haqiqatan hamkorlik qiladigan tashkilotlar qo'yiladi (06-topshiriq).
        */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 mb-6">
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Diqqat.</span> Hamkor tashkilot logotipi uning savdo
            belgisi hisoblanadi. Saytga faqat institut bilan haqiqatan hamkorlik qiladigan
            tashkilotlar logotipi qo'yiladi. Logotip fayllari hozircha{' '}
            <code className="bg-white px-1 py-0.5 rounded">public/images/partners/</code> papkasida
            saqlanadi, manzil <code className="bg-white px-1 py-0.5 rounded">/images/partners/nom.png</code>{' '}
            ko'rinishida yoziladi.
          </p>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-xl my-4">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-gray-900">
                  {editItem ? t('admin.edit') : t('admin.add_new')} — {t('admin.partners')}
                </h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                {(['Uz', 'En', 'Ru'] as const).map((suffix) => (
                  <div key={suffix}>
                    <label className="label">Tashkilot nomi ({suffix.toUpperCase()}) *</label>
                    <input {...register(`name${suffix}` as keyof FormData)} className="input" />
                    {errors[`name${suffix}` as keyof FormData] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`name${suffix}` as keyof FormData]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="label">Logotip manzili *</label>
                  <input {...register('logoUrl')} className="input" placeholder="/images/partners/nom.png" />
                  {errors.logoUrl && <p className="text-red-500 text-xs mt-1">{errors.logoUrl.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Veb-sayti</label>
                    <input {...register('websiteUrl')} className="input" placeholder="https://..." />
                    {errors.websiteUrl && <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>}
                  </div>
                  <div>
                    <label className="label">Tartib raqami</label>
                    <input type="number" {...register('order')} className="input" defaultValue={0} />
                  </div>
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
                  <th className="text-left font-medium px-4 py-3">Logotip</th>
                  <th className="text-left font-medium px-4 py-3">Nomi</th>
                  <th className="text-left font-medium px-4 py-3">Veb-sayt</th>
                  <th className="text-left font-medium px-4 py-3">Tartib</th>
                  <th className="text-right font-medium px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      Hamkorlar hali kiritilmagan. Ro'yxat bo'sh bo'lganda saytda bo'lim ko'rinmaydi.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className={clsx('border-t border-gray-100', !item.isActive && 'opacity-50')}>
                    <td className="px-4 py-3">
                      <img src={item.logoUrl} alt={item.nameUz} className="h-8 w-auto max-w-[120px] object-contain" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nameUz}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{item.websiteUrl ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{item.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => updateMutation.mutate({ id: item.id, values: { isActive: !item.isActive } })}
                          title={item.isActive ? 'Yashirish' : "Ko'rsatish"}
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
