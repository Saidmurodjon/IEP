import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Calendar, FileEdit, Newspaper, Check, Settings2, Link2, Quote } from 'lucide-react';
import { formatDate } from '@/lib/date';
import clsx from 'clsx';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUploadField from '@/components/admin/FileUploadField';
import AdminFormPage, { FormSection } from '@/components/admin/AdminFormPage';
import LangTabs, { LANG_TABS, type LangSuffix } from '@/components/admin/LangTabs';
import { useToast } from '@/components/Toast';
import { slugify, uniqueSlug } from '@/lib/slug';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';

const schema = z.object({
  // Bo'sh bo'lsa `submit` sarlavhadan hosil qiladi.
  slug: z.string(),
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  summaryUz: z.string().min(1), summaryEn: z.string().min(1), summaryRu: z.string().min(1),
  contentUz: z.string().min(1), contentEn: z.string().min(1), contentRu: z.string().min(1),
  imageUrl: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

type NewsItem = FormData & { id: string; publishedAt: string; isPublished: boolean };

export default function AdminNewsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<LangSuffix>('Uz');
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news-list'],
    // Admin panelda qoralamalar ham ko'rinadi.
    queryFn: () => newsApi.list(1, 50, true),
  });

  const items: NewsItem[] = data?.data?.data ?? [];

  const {
    register, handleSubmit, reset, setValue, watch, getValues,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const titleUz = watch('titleUz');
  const slug = watch('slug');
  const imageUrl = watch('imageUrl');
  const isPublished = watch('isPublished');
  const values = watch();

  // Shakl ochiq va o'zgargan bo'lsa — sahifadan chiqishda ogohlantirish.
  useUnsavedWarning(showForm && isDirty);

  // Sarlavha yozilganda havola avtomatik shakllanadi. Saqlangan yozuvda
  // ATAYLAB o'zgarmaydi — eski havolalar buzilmasligi kerak.
  useEffect(() => {
    if (editItem) return;
    const base = titleUz ? slugify(titleUz) : '';
    setValue('slug', base ? uniqueSlug(base, items.map((item) => item.slug)) : '', { shouldDirty: false });
  }, [titleUz, editItem, setValue, items]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-news-list'] });
    qc.invalidateQueries({ queryKey: ['news'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) => newsApi.create(data),
    onSuccess: () => { refresh(); toast.success(t('toast.news_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) => newsApi.update(id, data),
    onSuccess: () => { refresh(); toast.success(t('toast.news_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => { refresh(); toast.success(t('toast.news_deleted')); },
    onError: (error) => toast.showError(error),
  });

  const bulk = useBulkSelection();
  const [bulkBusy, setBulkBusy] = useState(false);

  const runBulk = async (ids: string[], action: (id: string) => Promise<unknown>) => {
    setBulkBusy(true);
    const results = await Promise.allSettled(ids.map(action));
    setBulkBusy(false);
    bulk.clear();
    refresh();
    return results.filter((r) => r.status === 'rejected').length;
  };

  const bulkDelete = async () => {
    const ids = [...bulk.selected];
    if (!confirm(t('admin.bulk_confirm_delete', { count: ids.length }))) return;
    const failed = await runBulk(ids, (id) => newsApi.delete(id));
    const done = ids.length - failed;
    if (failed === 0) toast.success(t('admin.bulk_delete_done', { count: done }));
    else toast.error(t('admin.bulk_delete_partial', { done, failed }));
  };

  const bulkSetDraft = async () => {
    const ids = [...bulk.selected];
    const failed = await runBulk(ids, (id) => newsApi.update(id, { isPublished: false }));
    const done = ids.length - failed;
    if (failed === 0) toast.success(t('admin.bulk_draft_done', { count: done }));
    else toast.error(t('admin.bulk_draft_partial', { done, failed }));
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); setActiveTab('Uz'); reset(); };

  /** O'zbekcha matnni joriy yorliqqa ko'chiradi — keyin tarjima qilinadi. */
  const copyFromUz = () => {
    const current = getValues();
    setValue(`title${activeTab}` as keyof FormData, current.titleUz, { shouldDirty: true });
    setValue(`summary${activeTab}` as keyof FormData, current.summaryUz, { shouldDirty: true });
    setValue(`content${activeTab}` as keyof FormData, current.contentUz, { shouldDirty: true });
    toast.success(t('toast.copied_from_uz'));
  };

  /** Qaysi til yorlig'i to'ldirilgan — moderator qolganini ko'radi. */
  const filled: Record<LangSuffix, boolean> = {
    Uz: !!values.titleUz && !!values.contentUz,
    En: !!values.titleEn && !!values.contentEn,
    Ru: !!values.titleRu && !!values.contentRu,
  };

  /**
   * Tahrirlash uchun TO'LIQ yozuv olinadi.
   *
   * Ro'yxat endpointi `content` maydonlarini qaytarmaydi (ular og'ir), shuning
   * uchun ro'yxatdagi yozuvni shaklga solib bo'lmaydi — tahrirlagich bo'sh
   * ochilardi va moderator matn yozsa eski kontent yo'qolardi.
   */
  const openEdit = async (item: NewsItem) => {
    try {
      const response = await newsApi.get(item.slug, true);
      const full = response.data.data as NewsItem;
      setEditItem(full);
      Object.entries(full).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        setValue(key as keyof FormData, value as never);
      });
      // `<input type="date">` faqat `yyyy-mm-dd` shaklini qabul qiladi.
      setValue('publishedAt', new Date(full.publishedAt).toISOString().slice(0, 10));
      setShowForm(true);
    } catch (error) {
      toast.showError(error);
    }
  };

  const submit = (data: FormData, publish?: boolean) => {
    const payload: FormData = {
      ...data,
      slug: data.slug || uniqueSlug(slugify(data.titleUz), items.map((item) => item.slug)),
      ...(publish === undefined ? {} : { isPublished: publish }),
    };
    if (editItem) updateMutation.mutate({ id: editItem.id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <>
      <Helmet><title>{t('adminD.news.helmet')}</title></Helmet>
      <div className="p-6">
        {showForm ? (
          <AdminFormPage
            title={`${editItem ? t('admin.edit') : t('admin.add_new')} — ${t('adminD.news.modal_suffix')}`}
            subtitle={t('admin.modal_subtitle')}
            icon={Newspaper}
            size="full"
            bare
            onClose={closeForm}
            onSubmit={handleSubmit((data) => submit(data))}
            footer={
              <>
                <button type="button" onClick={closeForm} className="btn-secondary sm:mr-auto">
                  {t('admin.cancel')}
                </button>
                {/* Qoralama ochiq sahifada ko'rinmaydi */}
                {isPublished !== false ? (
                  <button
                    type="button"
                    onClick={handleSubmit((data) => submit(data, false))}
                    className="btn-secondary"
                  >
                    {t('admin.save_draft')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit((data) => submit(data, true))}
                    className="btn-secondary"
                  >
                    {t('admin.publish')}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary gap-2 px-6"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {t('admin.save')}
                </button>
              </>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              {/* Tarjima qilinadigan maydonlar — til yorliqlari ichida */}
              <FormSection title={t('adminD.news.section_content')} icon={FileEdit}>
                <LangTabs
                  active={activeTab}
                  onChange={setActiveTab}
                  filled={filled}
                  onCopyFromUz={copyFromUz}
                />

                {LANG_TABS.map((tab) => {
                  const lang = tab.key.toLowerCase();
                  const titleError = errors[`title${tab.key}` as keyof FormData];
                  return (
                    <div key={tab.key} className={clsx('space-y-5', activeTab === tab.key ? '' : 'hidden')}>
                      <div>
                        <label htmlFor={`news-title-${lang}`} className="label">
                          {t(`admin.title_${lang}`)}
                          {tab.key === 'Uz' && <span className="text-red-600 dark:text-red-300"> *</span>}
                        </label>
                        <input
                          id={`news-title-${lang}`}
                          {...register(`title${tab.key}` as keyof FormData)}
                          className={clsx(
                            'input !py-2.5 !text-base font-medium',
                            titleError && 'border-red-400 focus:ring-red-400'
                          )}
                        />
                        {titleError && (
                          <p className="text-red-600 dark:text-red-300 text-xs mt-1">{t('adminD.news.title_required')}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`news-summary-${lang}`} className="label">
                          {t('adminD.news.summary_lang', { lang: tab.key.toUpperCase() })}
                        </label>
                        <textarea
                          id={`news-summary-${lang}`}
                          {...register(`summary${tab.key}` as keyof FormData)}
                          rows={3}
                          className="input resize-y"
                        />
                      </div>
                      <div>
                        <p className="label">{t(`admin.content_${lang}`)}</p>
                        {/* Tahrirlagich lazy yuklanadi — ochiq sahifalar hajmini ko'tarmaydi */}
                        <RichTextEditor
                          value={(values[`content${tab.key}` as keyof FormData] as string) ?? ''}
                          onChange={(html) =>
                            setValue(`content${tab.key}` as keyof FormData, html, { shouldDirty: true })
                          }
                          ownerType="news"
                          ownerId={editItem?.id}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t('adminD.news.paste_hint')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </FormSection>

              <div className="space-y-5">
                <FormSection title={t('adminD.news.section_publish')} icon={Settings2}>
                  <div>
                    <label htmlFor="news-published-at" className="label">{t('adminD.news.published_at')}</label>
                    <input id="news-published-at" type="date" {...register('publishedAt')} className="input" />
                  </div>

                  {/*
                    Havola faqat o'zbekcha sarlavhadan hosil bo'ladi va qo'lda
                    tahrirlanmaydi — saqlangan yozuvda o'zgarmaydi (eski havolalar
                    buzilmasin).
                  */}
                  <div>
                    <p className="label">{t('adminD.news.slug')}</p>
                    <input type="hidden" {...register('slug')} />
                    <div
                      aria-live="polite"
                      className="flex items-start gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5 text-sm"
                    >
                      <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden="true" />
                      {slug ? (
                        <span className="font-mono text-gray-800 dark:text-gray-200 break-all">/news/{slug}</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">{t('adminD.news.slug_empty')}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('adminD.news.slug_hint')}</p>
                  </div>

                  <FileUploadField
                    kind="image"
                    label={t('adminD.news.cover_image')}
                    value={imageUrl ?? null}
                    onChange={(url) => setValue('imageUrl', url ?? '', { shouldDirty: true })}
                    ownerType="news"
                    ownerId={editItem?.id}
                  />
                </FormSection>

                {/*
                  373-son qarorning 4-bandi: boshqa manbadan olingan axborot
                  faqat manba ko'rsatilgan holda joylashtiriladi.
                */}
                <FormSection title={t('adminD.news.section_source')} icon={Quote}>
                  <p className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <Trans
                      i18nKey="adminD.news.source_notice"
                      components={{ b: <span className="font-semibold" /> }}
                    />
                  </p>
                  <div>
                    <label htmlFor="news-source-name" className="label">{t('adminD.news.source_name')}</label>
                    <input
                      id="news-source-name"
                      {...register('sourceName')}
                      className="input"
                      placeholder={t('adminD.news.source_name_placeholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="news-source-url" className="label">{t('adminD.news.source_url')}</label>
                    <input
                      id="news-source-url"
                      {...register('sourceUrl')}
                      className="input"
                      placeholder="https://..."
                    />
                    {errors.sourceUrl && (
                      <p className="text-red-600 dark:text-red-300 text-xs mt-1">{errors.sourceUrl.message}</p>
                    )}
                  </div>
                </FormSection>
              </div>
            </div>
          </AdminFormPage>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.news')}</h1>
              <button
                onClick={() => {
                  // Nashr sanasi sukut bo'yicha bugungi kun.
                  reset({ slug: '', publishedAt: new Date().toISOString().slice(0, 10), isPublished: true });
                  setEditItem(null);
                  setShowForm(true);
                }}
                className="btn-primary gap-2"
              >
                <Plus className="h-4 w-4" /> {t('admin.add_new')}
              </button>
            </div>

            {/* Form modal */}

            {/* List */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
            ) : (
              <>
                <BulkActionsBar count={bulk.selected.size} onCancel={bulk.clear}>
                  <button
                    type="button"
                    onClick={() => void bulkDelete()}
                    disabled={bulkBusy}
                    className="btn-secondary !text-red-600 dark:!text-red-300 !border-red-200 dark:!border-red-800 hover:!bg-red-50 dark:hover:!bg-red-900/30 disabled:opacity-60"
                  >
                    {t('admin.bulk_delete')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void bulkSetDraft()}
                    disabled={bulkBusy}
                    className="btn-secondary disabled:opacity-60"
                  >
                    {t('admin.bulk_set_draft')}
                  </button>
                </BulkActionsBar>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          aria-label={t('admin.select_all')}
                          checked={items.length > 0 && items.every((item) => bulk.selected.has(item.id))}
                          onChange={() => bulk.toggleAll(items.map((item) => item.id))}
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{t('adminD.news.th_title')}</th>
                      <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium hidden sm:table-cell">{t('adminD.news.th_date')}</th>
                      <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{t('adminD.common.th_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors">
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
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">{item.titleUz}</span>
                            {item.isPublished === false && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium flex-shrink-0">
                                <FileEdit className="h-3 w-3" />
                                {t('admin.draft')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.publishedAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => void openEdit(item)}
                              aria-label={t('admin.edit')}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t('admin.confirm_delete'))) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                              aria-label={t('admin.delete')}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('adminD.news.empty')}
                        </td>
                      </tr>
                    )}
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
