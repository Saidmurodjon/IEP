import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Sparkles, Target, History, Milestone, Heart, BarChart3, Plus, Trash2, ArrowUp, ArrowDown,
  ExternalLink, Save, Loader2, Check,
} from 'lucide-react';
import clsx from 'clsx';
import { ABOUT_VALUE_ICONS, type AboutContent, type Lang } from '@energetika/shared';
import { aboutApi } from '@/lib/api';
import { VALUE_ICON_MAP, emptyTranslation, type AboutResponse } from '@/lib/about';
import { FormSection } from '@/components/admin/AdminFormPage';
import FieldError from '@/components/FieldError';
import { useToast } from '@/components/Toast';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';

const LANGS: ReadonlyArray<{ key: Lang; label: string }> = [
  { key: 'uz', label: "O'zbek" },
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
];

/** Shakl holati: raqamli maydonlar `input` bilan ishlash uchun satr. */
type FormValues = Omit<AboutContent, 'foundedYear' | 'stats'> & {
  foundedYear: string;
  stats: { scientists: string; staff: string };
};

const toForm = (c: AboutContent): FormValues => ({
  ...c,
  foundedYear: c.foundedYear?.toString() ?? '',
  stats: { scientists: c.stats.scientists?.toString() ?? '', staff: c.stats.staff?.toString() ?? '' },
});

const toNumber = (v: string): number | null => (v.trim() === '' ? null : Number(v));

const fromForm = (v: FormValues): AboutContent => ({
  ...v,
  foundedYear: toNumber(v.foundedYear),
  stats: { scientists: toNumber(v.stats.scientists), staff: toNumber(v.stats.staff) },
});

/** Tarjima qilinadigan matn maydonlari — til tugmasidagi belgi va «nusxa» uchun. */
const TEXT_KEYS = ['tagline', 'intro', 'mission', 'vision', 'history'] as const;

export default function AdminAboutPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [lang, setLang] = useState<Lang>('uz');

  // Oynaga qaytganda qayta yuklanmaydi — aks holda `reset` saqlanmagan matnni o'chirib yuboradi.
  const { data, isLoading } = useQuery({ queryKey: ['about'], queryFn: () => aboutApi.get(), refetchOnWindowFocus: false });
  const about = (data?.data as AboutResponse | undefined)?.data;

  const { register, control, handleSubmit, reset, watch, setValue, getValues, formState: { isDirty, errors } } =
    useForm<FormValues>();
  const milestones = useFieldArray({ control, name: 'milestones' });
  const values = useFieldArray({ control, name: 'values' });

  // Forma bazadagi qiymat bilan faqat BIR MARTA to'ldiriladi; keyingi qayta
  // yuklashlar saqlanmagan matnni o'chirmasin. Saqlangandan keyin — `reset(v)`.
  const loaded = useRef(false);
  useEffect(() => {
    if (!about || loaded.current) return;
    loaded.current = true;
    reset(toForm(about));
  }, [about, reset]);

  useUnsavedWarning(isDirty);

  const saveMut = useMutation({
    mutationFn: (v: FormValues) => aboutApi.update(fromForm(v)),
    onSuccess: (_res, v) => {
      reset(v);
      qc.invalidateQueries({ queryKey: ['about'] });
      toast.success(t('adminAbout.saved'));
    },
    onError: (error) => toast.showError(error),
  });

  const watched = watch();
  const filled = (l: Lang) => TEXT_KEYS.every((k) => (watched[k]?.[l] ?? '').trim() !== '');

  /** Joriy tilga o'zbekcha matnni ko'chiradi — faqat bo'sh maydonlarga. */
  const copyFromUz = () => {
    const v = getValues();
    for (const k of TEXT_KEYS) {
      if (!v[k][lang].trim()) setValue(`${k}.${lang}`, v[k].uz, { shouldDirty: true });
    }
    v.milestones.forEach((m, i) => {
      if (!m.title[lang].trim()) setValue(`milestones.${i}.title.${lang}`, m.title.uz, { shouldDirty: true });
      if (!m.text[lang].trim()) setValue(`milestones.${i}.text.${lang}`, m.text.uz, { shouldDirty: true });
    });
    v.values.forEach((m, i) => {
      if (!m.title[lang].trim()) setValue(`values.${i}.title.${lang}`, m.title.uz, { shouldDirty: true });
      if (!m.text[lang].trim()) setValue(`values.${i}.text.${lang}`, m.text.uz, { shouldDirty: true });
    });
  };

  if (isLoading || !about) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-600 dark:text-gray-400" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {t('common.loading')}
      </div>
    );
  }

  const langField = (name: string, labelKey: string, opts: { rows?: number; max: number; hint?: string }) => {
    const id = `about-${name.replace(/\./g, '-')}`;
    const hintId = opts.hint ? `${id}-hint` : undefined;
    const path = `${name}.${lang}` as `tagline.${Lang}`;
    return (
      <div>
        <label htmlFor={id} className="label">
          {t(labelKey)} <span className="font-normal text-gray-500 dark:text-gray-400">({lang.toUpperCase()})</span>
        </label>
        {opts.rows ? (
          <textarea id={id} rows={opts.rows} maxLength={opts.max} aria-describedby={hintId} className="input" {...register(path)} />
        ) : (
          <input id={id} maxLength={opts.max} aria-describedby={hintId} className="input" {...register(path)} />
        )}
        {opts.hint && <p id={hintId} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{opts.hint}</p>}
      </div>
    );
  };

  return (
    <>
      <Helmet><title>{t('adminAbout.helmet')}</title></Helmet>
      <div className="p-6 max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('adminAbout.title')}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('adminAbout.subtitle')}</p>
          </div>
          <a
            href={`/${lang}/about`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary gap-2"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> {t('adminAbout.view_page')}
          </a>
        </div>

        <form onSubmit={handleSubmit((v) => saveMut.mutate(v))} noValidate className="space-y-5">
          {/* Til almashtirgich — barcha matn maydonlariga birdan ta'sir qiladi */}
          <div className="card sticky top-2 z-10 flex flex-wrap items-center gap-3 p-3">
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

          <FormSection title={t('adminAbout.sec_hero')} description={t('adminAbout.sec_hero_desc')} icon={Sparkles}>
            {langField('tagline', 'adminAbout.tagline', { max: 200 })}
            {langField('intro', 'adminAbout.intro', { rows: 3, max: 1000 })}
          </FormSection>

          <FormSection title={t('adminAbout.sec_stats')} description={t('adminAbout.sec_stats_desc')} icon={BarChart3}>
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                ['foundedYear', 'adminAbout.founded_year', 1900, 2100],
                ['stats.scientists', 'adminAbout.scientists', 0, 10000],
                ['stats.staff', 'adminAbout.staff', 0, 10000],
              ] as const).map(([name, labelKey, min, max]) => {
                const id = `about-${name.replace('.', '-')}`;
                return (
                  <div key={name}>
                    <label htmlFor={id} className="label">{t(labelKey)}</label>
                    <input id={id} type="number" inputMode="numeric" min={min} max={max} className="input" {...register(name)} />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('adminAbout.stats_hint')}</p>
          </FormSection>

          <FormSection title={t('adminAbout.sec_mission')} description={t('adminAbout.sec_mission_desc')} icon={Target}>
            {langField('mission', 'adminAbout.mission', { rows: 4, max: 1500 })}
            {langField('vision', 'adminAbout.vision', { rows: 4, max: 1500 })}
          </FormSection>

          <FormSection title={t('adminAbout.sec_history')} icon={History}>
            {langField('history', 'adminAbout.history', { rows: 8, max: 8000, hint: t('adminAbout.history_hint') })}
          </FormSection>

          {/* Tarixiy sanalar */}
          <FormSection title={t('adminAbout.sec_milestones')} description={t('adminAbout.sec_milestones_desc')} icon={Milestone}>
            {milestones.fields.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminAbout.milestones_empty')}</p>
            )}
            <ol className="space-y-3">
              {milestones.fields.map((field, i) => {
                const yearId = `about-ms-${field.id}-year`;
                const yearErr = errors.milestones?.[i]?.year?.message;
                return (
                  <li key={field.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                      <div>
                        <label htmlFor={yearId} className="label">{t('adminAbout.year')}</label>
                        <input
                          id={yearId}
                          maxLength={20}
                          aria-invalid={!!yearErr}
                          aria-describedby={yearErr ? `${yearId}-err` : undefined}
                          className="input"
                          {...register(`milestones.${i}.year`, { validate: (v) => v.trim() !== '' || t('adminAbout.err_year') })}
                        />
                        <FieldError id={`${yearId}-err`} message={yearErr} />
                      </div>
                      <div>
                        <label htmlFor={`about-ms-${field.id}-title`} className="label">
                          {t('adminAbout.ms_title')} ({lang.toUpperCase()})
                        </label>
                        <input id={`about-ms-${field.id}-title`} maxLength={200} className="input" {...register(`milestones.${i}.title.${lang}`)} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor={`about-ms-${field.id}-text`} className="label">
                        {t('adminAbout.ms_text')} ({lang.toUpperCase()})
                      </label>
                      <textarea id={`about-ms-${field.id}-text`} rows={2} maxLength={1000} className="input" {...register(`milestones.${i}.text.${lang}`)} />
                    </div>
                    <RowActions
                      index={i}
                      count={milestones.fields.length}
                      onMove={milestones.move}
                      onRemove={milestones.remove}
                    />
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              disabled={milestones.fields.length >= 40}
              onClick={() => milestones.append({ year: '', title: emptyTranslation(), text: emptyTranslation() })}
              className="btn-secondary gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> {t('adminAbout.add_milestone')}
            </button>
          </FormSection>

          {/* Qadriyatlar */}
          <FormSection title={t('adminAbout.sec_values')} description={t('adminAbout.sec_values_desc')} icon={Heart}>
            <ol className="space-y-3">
              {values.fields.map((field, i) => {
                const current = watched.values?.[i]?.icon ?? 'atom';
                return (
                  <li key={field.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <fieldset>
                      <legend className="label">{t('adminAbout.icon')}</legend>
                      <div className="flex flex-wrap gap-2">
                        {ABOUT_VALUE_ICONS.map((icon) => {
                          const Icon = VALUE_ICON_MAP[icon];
                          return (
                            <label
                              key={icon}
                              className={clsx(
                                'flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                                current === icon
                                  ? 'border-primary-600 bg-primary-600 text-white'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                              )}
                            >
                              <input type="radio" value={icon} className="sr-only" {...register(`values.${i}.icon`)} />
                              <Icon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">{t(`adminAbout.icons.${icon}`)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="mt-3">
                      <label htmlFor={`about-val-${field.id}-title`} className="label">
                        {t('adminAbout.val_title')} ({lang.toUpperCase()})
                      </label>
                      <input id={`about-val-${field.id}-title`} maxLength={120} className="input" {...register(`values.${i}.title.${lang}`)} />
                    </div>
                    <div className="mt-3">
                      <label htmlFor={`about-val-${field.id}-text`} className="label">
                        {t('adminAbout.val_text')} ({lang.toUpperCase()})
                      </label>
                      <textarea id={`about-val-${field.id}-text`} rows={2} maxLength={500} className="input" {...register(`values.${i}.text.${lang}`)} />
                    </div>
                    <RowActions index={i} count={values.fields.length} onMove={values.move} onRemove={values.remove} />
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              disabled={values.fields.length >= 8}
              onClick={() => values.append({ icon: 'atom', title: emptyTranslation(), text: emptyTranslation() })}
              className="btn-secondary gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> {t('adminAbout.add_value')}
            </button>
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

/** Ro'yxat qatori: yuqoriga / pastga / o'chirish. */
function RowActions({ index, count, onMove, onRemove }: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation();
  const btn = 'flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800';
  return (
    <div className="mt-3 flex justify-end gap-1">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={t('adminAbout.move_up')}>
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={t('adminAbout.move_down')}>
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={clsx(btn, 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950')}
        onClick={() => onRemove(index)}
        aria-label={t('adminAbout.remove')}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
