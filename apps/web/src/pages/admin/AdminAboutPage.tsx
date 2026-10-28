import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AlignLeft, BookOpen, BarChart3, ExternalLink, Save, Loader2, Check } from 'lucide-react';
import clsx from 'clsx';
import type { AboutContent, Lang } from '@energetika/shared';
import { aboutApi } from '@/lib/api';
import { isEmptyHtml, type AboutResponse } from '@/lib/about';
import { FormSection } from '@/components/admin/AdminFormPage';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useToast } from '@/components/Toast';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';

const LANGS: ReadonlyArray<{ key: Lang; label: string }> = [
  { key: 'uz', label: "O'zbek" },
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
];

export default function AdminAboutPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [lang, setLang] = useState<Lang>('uz');

  // Oynaga qaytganda qayta yuklanmaydi — aks holda saqlanmagan matn ustiga yozilardi.
  const { data, isLoading } = useQuery({ queryKey: ['about'], queryFn: () => aboutApi.get(), refetchOnWindowFocus: false });
  const res = data?.data as AboutResponse | undefined;

  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { isDirty } } = useForm<AboutContent>();

  // Forma bazadagi qiymat bilan faqat BIR MARTA to'ldiriladi; saqlangandan keyin — `reset(v)`.
  // Tahrirlagich boshlang'ich qiymatni faqat yaratilishida oladi, shuning uchun
  // u forma to'ldirilgandan KEYIN chiziladi (`ready`).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!res || ready) return;
    reset(res.data);
    setReady(true);
  }, [res, ready, reset]);

  useUnsavedWarning(isDirty);

  const saveMut = useMutation({
    mutationFn: (v: AboutContent) => aboutApi.update(v),
    onSuccess: (_r, v) => {
      reset(v);
      qc.invalidateQueries({ queryKey: ['about'] });
      toast.success(t('adminAbout.saved'));
    },
    onError: (error) => toast.showError(error),
  });

  const values = watch();
  const filled = (l: Lang) =>
    (values.summary?.[l] ?? '').trim() !== '' && !isEmptyHtml(values.content?.[l] ?? '');

  const copyFromUz = () => {
    const v = getValues();
    if (!v.summary[lang].trim()) setValue(`summary.${lang}`, v.summary.uz, { shouldDirty: true });
    if (isEmptyHtml(v.content[lang])) setValue(`content.${lang}`, v.content.uz, { shouldDirty: true });
  };

  if (isLoading || !res || !ready) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-600 dark:text-gray-400" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {t('common.loading')}
      </div>
    );
  }

  const stats = [
    { label: t('home.stats_labs'), value: res.stats.labs },
    { label: t('home.stats_scientists'), value: res.stats.scientists },
    { label: t('home.stats_staff'), value: res.stats.employees },
    { label: t('home.stats_publications'), value: res.stats.publications },
  ];

  return (
    <>
      <Helmet><title>{t('adminAbout.helmet')}</title></Helmet>
      <div className="p-6 max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('adminAbout.title')}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('adminAbout.subtitle')}</p>
          </div>
          <a href={`/${lang}/about`} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> {t('adminAbout.view_page')}
          </a>
        </div>

        <form onSubmit={handleSubmit((v) => saveMut.mutate(v))} noValidate className="space-y-5">
          <div className="card flex flex-wrap items-center gap-3 p-3">
            <span id="about-lang-label" className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('adminLab.language')}
            </span>
            <div role="group" aria-labelledby="about-lang-label" className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  aria-pressed={lang === l.key}
                  onClick={() => setLang(l.key)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500',
                    lang === l.key
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
                  )}
                >
                  {l.label}
                  {filled(l.key) ? (
                    <Check className="h-4 w-4" aria-label={t('admin.filled')} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" role="img" aria-label={t('admin.empty_tab')} />
                  )}
                </button>
              ))}
            </div>
            {lang !== 'uz' && (
              <button
                type="button"
                onClick={copyFromUz}
                className="ml-auto text-xs font-medium text-primary-700 hover:underline dark:text-primary-300"
              >
                {t('adminAbout.copy_empty_from_uz')}
              </button>
            )}
          </div>

          <FormSection title={t('adminAbout.sec_summary')} description={t('adminAbout.sec_summary_desc')} icon={AlignLeft}>
            {LANGS.map((l) => (
              <div key={l.key} className={lang === l.key ? '' : 'hidden'}>
                <label htmlFor={`about-summary-${l.key}`} className="label">
                  {t('adminAbout.summary')} ({l.key.toUpperCase()})
                </label>
                <textarea
                  id={`about-summary-${l.key}`}
                  rows={3}
                  maxLength={600}
                  className="input"
                  {...register(`summary.${l.key}`)}
                />
              </div>
            ))}
          </FormSection>

          <FormSection title={t('adminAbout.sec_content')} description={t('adminAbout.sec_content_desc')} icon={BookOpen}>
            {/* Har bir til uchun alohida tahrirlagich — til almashganda kursor/tarix yo'qolmasin. */}
            {LANGS.map((l) => (
              <div key={l.key} className={lang === l.key ? '' : 'hidden'}>
                <p className="label">{t('adminAbout.content')} ({l.key.toUpperCase()})</p>
                <RichTextEditor
                  value={values.content?.[l.key] ?? ''}
                  onChange={(html) => setValue(`content.${l.key}`, html, { shouldDirty: true })}
                  ownerType="about"
                  ownerId="page"
                />
              </div>
            ))}
          </FormSection>

          <FormSection title={t('adminAbout.sec_stats')} description={t('adminAbout.sec_stats_desc')} icon={BarChart3}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <dt className="text-xs text-gray-600 dark:text-gray-400">{label}</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</dd>
                </div>
              ))}
            </dl>
          </FormSection>

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
            {isDirty && <span className="mr-auto text-sm text-amber-700 dark:text-amber-300">{t('adminAbout.unsaved')}</span>}
            <button type="submit" disabled={saveMut.isPending || !isDirty} className="btn-primary gap-2">
              {saveMut.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <Save className="h-4 w-4" aria-hidden="true" />}
              {t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
