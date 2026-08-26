import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/date';
import clsx from 'clsx';

const schema = z.object({
  slug: z.string().min(1, 'Slug kiriting'),
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  summaryUz: z.string().min(1), summaryEn: z.string().min(1), summaryRu: z.string().min(1),
  contentUz: z.string().min(1), contentEn: z.string().min(1), contentRu: z.string().min(1),
  imageUrl: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type NewsItem = FormData & { id: string; publishedAt: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function AdminNewsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<'uz' | 'en' | 'ru'>('uz');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news-list'],
    queryFn: () => newsApi.list(1, 50),
  });

  const items: NewsItem[] = data?.data?.data ?? [];

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const titleUz = watch('titleUz');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => newsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news-list'] }); closeForm(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) => newsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news-list'] }); closeForm(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-news-list'] }),
  });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    Object.entries(item).forEach(([k, v]) => setValue(k as keyof FormData, v as string));
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (!data.slug) data.slug = slugify(data.titleUz);
    if (editItem) updateMutation.mutate({ id: editItem.id, data });
    else createMutation.mutate(data);
  };

  const TABS = [
    { key: 'uz', label: "O'zbek" },
    { key: 'en', label: 'English' },
    { key: 'ru', label: 'Русский' },
  ] as const;

  return (
    <>
      <Helmet><title>Yangiliklar | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.news')}</h1>
          <button
            onClick={() => { reset(); setShowForm(true); }}
            className="btn-primary gap-2"
          >
            <Plus className="h-4 w-4" /> {t('admin.add_new')}
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold text-gray-900">
                  {editItem ? t('admin.edit') : t('admin.add_new')} — Yangilik
                </h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div>
                  <label className="label">Slug</label>
                  <input
                    {...register('slug')}
                    className="input"
                    placeholder="yangilik-slugi"
                    onBlur={() => {
                      if (!watch('slug') && titleUz) {
                        setValue('slug', slugify(titleUz));
                      }
                    }}
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                </div>

                {/* Language tabs */}
                <div>
                  <div className="flex gap-1 border-b mb-4">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                          activeTab === tab.key
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {TABS.map((tab) => (
                    <div key={tab.key} className={activeTab === tab.key ? '' : 'hidden'}>
                      <div className="space-y-3">
                        <div>
                          <label className="label">{t(`admin.title_${tab.key}`)}</label>
                          <input {...register(`title${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} className="input" />
                        </div>
                        <div>
                          <label className="label">Qisqacha ({tab.key.toUpperCase()})</label>
                          <textarea {...register(`summary${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} rows={2} className="input resize-none" />
                        </div>
                        <div>
                          <label className="label">{t(`admin.content_${tab.key}`)}</label>
                          <textarea {...register(`content${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData)} rows={6} className="input resize-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Rasm URL (ixtiyoriy)</label>
                  <input {...register('imageUrl')} className="input" placeholder="https://..." />
                </div>

                {/*
                  373-son qarorning 4-bandi: boshqa manbadan olingan axborot
                  faqat manba ko'rsatilgan holda joylashtiriladi.
                */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-semibold">Diqqat.</span> Agar material boshqa manbadan
                    olingan bo'lsa, manbani ko'rsatish <span className="font-semibold">majburiy</span>
                    {' '}(Vazirlar Mahkamasining 2021-yil 15-iyundagi 373-son qarori, 4-band).
                    Institutning o'z materiali bo'lsa, bu maydonlar bo'sh qoladi.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Manba nomi</label>
                      <input
                        {...register('sourceName')}
                        className="input"
                        placeholder="Masalan: UzA"
                      />
                    </div>
                    <div>
                      <label className="label">Manba havolasi</label>
                      <input
                        {...register('sourceUrl')}
                        className="input"
                        placeholder="https://..."
                      />
                      {errors.sourceUrl && (
                        <p className="text-red-500 text-xs mt-1">{errors.sourceUrl.message}</p>
                      )}
                    </div>
                  </div>
                </div>

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

        {/* List */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Sarlavha</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Sana</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-xs">{item.titleUz}</div>
                      <div className="text-xs text-gray-400">{item.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('admin.confirm_delete'))) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Yangiliklar yo'q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
