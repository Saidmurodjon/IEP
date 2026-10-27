import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, ExternalLink, FlaskConical, Users, ListChecks, CalendarDays, Crown, Pencil, UserMinus,
  UserPlus, Link2, AlertCircle, Check, Info, Image as ImageIcon, Phone, BookOpen, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi, fileUrl } from '@/lib/api';
import { initials, type Employee } from '@/lib/employee';
import { flattenLabs, type Unit } from '@/lib/structure';
import { FormSection } from '@/components/admin/AdminFormPage';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUploadField from '@/components/admin/FileUploadField';
import EmployeeForm from '@/components/admin/EmployeeForm';
import { useToast } from '@/components/Toast';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { labCompleteness, countLines } from './AdminLabsPage';

type Suffix = 'Uz' | 'En' | 'Ru';
const LANGS: ReadonlyArray<{ key: Suffix; label: string }> = [
  { key: 'Uz', label: "O'zbek" },
  { key: 'En', label: 'English' },
  { key: 'Ru', label: 'Русский' },
];

const schema = z.object({
  nameUz: z.string().trim().min(1, 'adminLab.err_name'),
  nameEn: z.string().trim().min(1, 'adminLab.err_name'),
  nameRu: z.string().trim().min(1, 'adminLab.err_name'),
  descriptionUz: z.string(), descriptionEn: z.string(), descriptionRu: z.string(),
  contentUz: z.string(), contentEn: z.string(), contentRu: z.string(),
  directionsUz: z.string(), directionsEn: z.string(), directionsRu: z.string(),
  imageUrl: z.string(),
  room: z.string(),
  phone: z.string(),
  email: z.string().trim().email('adminLab.err_email').or(z.literal('')),
  foundedYear: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{4}$/.test(v) && +v >= 1900 && +v <= 2100), 'adminLab.err_year'),
  order: z.string().trim().refine((v) => v === '' || Number.isInteger(+v), 'adminLab.err_order'),
});
type FormData = z.infer<typeof schema>;

const EMPTY: FormData = {
  nameUz: '', nameEn: '', nameRu: '',
  descriptionUz: '', descriptionEn: '', descriptionRu: '',
  contentUz: '', contentEn: '', contentRu: '',
  directionsUz: '', directionsEn: '', directionsRu: '',
  imageUrl: '', room: '', phone: '', email: '', foundedYear: '', order: '0',
};

function toForm(lab: Unit): FormData {
  return {
    nameUz: lab.nameUz ?? '', nameEn: lab.nameEn ?? '', nameRu: lab.nameRu ?? '',
    descriptionUz: lab.descriptionUz ?? '', descriptionEn: lab.descriptionEn ?? '', descriptionRu: lab.descriptionRu ?? '',
    contentUz: lab.contentUz ?? '', contentEn: lab.contentEn ?? '', contentRu: lab.contentRu ?? '',
    directionsUz: lab.directionsUz ?? '', directionsEn: lab.directionsEn ?? '', directionsRu: lab.directionsRu ?? '',
    imageUrl: lab.imageUrl ?? '', room: lab.room ?? '', phone: lab.phone ?? '', email: lab.email ?? '',
    foundedYear: lab.foundedYear ? String(lab.foundedYear) : '',
    order: String(lab.order ?? 0),
  };
}

type TabKey = 'info' | 'staff';

export default function AdminLabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const [tab, setTab] = useState<TabKey>('info');
  const [lang, setLang] = useState<Suffix>('Uz');
  const [staffForm, setStaffForm] = useState<{ employee: Employee | null } | null>(null);

  const { data: treeData, isLoading } = useQuery({ queryKey: ['structure-admin'], queryFn: () => structureApi.tree() });
  const { data: empData } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => employeesApi.list(undefined, true),
  });
  const employees: Employee[] = empData?.data?.data ?? [];

  const lab = useMemo(
    () => (isNew ? undefined : flattenLabs((treeData?.data?.data ?? []) as Unit[]).find((u) => u.id === id)),
    [treeData, id, isNew],
  );
  const staff = useMemo(() => (lab ? employees.filter((e) => e.labId === lab.id) : []), [employees, lab]);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  useUnsavedWarning(isDirty);

  // Ma'lumot kelganda (yoki boshqa laboratoriyaga o'tilganda) shakl bir marta to'ldiriladi.
  const loadedId = useRef<string | null>(null);
  useEffect(() => {
    if (isNew) { reset(EMPTY); loadedId.current = null; return; }
    if (lab && loadedId.current !== lab.id) {
      reset(toForm(lab));
      loadedId.current = lab.id;
    }
  }, [lab, isNew, reset]);

  const values = watch();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['structure-admin'] });
    qc.invalidateQueries({ queryKey: ['structure'] });
  };

  const toPayload = (v: FormData) => ({
    nameUz: v.nameUz.trim(), nameEn: v.nameEn.trim(), nameRu: v.nameRu.trim(),
    descriptionUz: v.descriptionUz, descriptionEn: v.descriptionEn, descriptionRu: v.descriptionRu,
    contentUz: v.contentUz, contentEn: v.contentEn, contentRu: v.contentRu,
    directionsUz: v.directionsUz, directionsEn: v.directionsEn, directionsRu: v.directionsRu,
    imageUrl: v.imageUrl, room: v.room.trim(), phone: v.phone.trim(), email: v.email.trim(),
    foundedYear: v.foundedYear.trim() ? Number(v.foundedYear) : null,
    order: v.order.trim() ? Number(v.order) : 0,
  });

  const saveMut = useMutation({
    mutationFn: (v: FormData) =>
      isNew
        ? structureApi.create({ ...toPayload(v), type: 'laboratory', parentId: null })
        : structureApi.update(id as string, toPayload(v)),
    onSuccess: (res, v) => {
      invalidate();
      if (isNew) {
        toast.success(t('adminLab.created'));
        navigate(`/admin/labs/${res.data?.data?.id}`, { replace: true });
      } else {
        reset(v);
        toast.success(t('adminLab.saved'));
      }
    },
    onError: (error) => toast.showError(error),
  });

  const onInvalid = (errs: typeof errors) => {
    const first = LANGS.find((l) => errs[`name${l.key}` as keyof FormData]);
    if (first) setLang(first.key);
  };

  // ---- Xodimlar amallari ----
  const refreshStaff = () => {
    qc.invalidateQueries({ queryKey: ['admin-employees'] });
    qc.invalidateQueries({ queryKey: ['employees'] });
    invalidate();
  };
  const staffMut = useMutation({
    mutationFn: async (job: () => Promise<unknown>) => job(),
    onSuccess: () => { refreshStaff(); toast.success(t('toast.employee_saved')); },
    onError: (error) => { refreshStaff(); toast.showError(error); },
  });
  const toggleHead = (emp: Employee) =>
    staffMut.mutate(async () => {
      if (!emp.isUnitHead) {
        // Avval joriy rahbar olinadi — tranzaksiya yo'q, ketma-ket chaqiriladi.
        for (const other of staff.filter((s) => s.isUnitHead && s.id !== emp.id)) {
          await employeesApi.update(other.id, { isUnitHead: false });
        }
      }
      await employeesApi.update(emp.id, { isUnitHead: !emp.isUnitHead });
    });
  const detach = (emp: Employee) => {
    if (!confirm(t('adminLab.confirm_detach', { name: emp.fullNameUz }))) return;
    staffMut.mutate(() => employeesApi.update(emp.id, { labId: '', isUnitHead: false }));
  };

  // ---- Xodim shakli ochiq bo'lsa, butun sahifa o'rniga ko'rsatiladi ----
  if (staffForm && lab) {
    return (
      <div className="p-6">
        <EmployeeForm
          employee={staffForm.employee}
          presetLabId={lab.id}
          lockLab
          onClose={() => setStaffForm(null)}
          onSaved={refreshStaff}
        />
      </div>
    );
  }

  if (!isNew && isLoading) {
    return (
      <div className="p-6" aria-busy="true">
        <div className="card animate-pulse overflow-hidden">
          <div className="h-44 bg-gray-200 dark:bg-gray-800" />
          <div className="h-24" />
        </div>
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }
  if (!isNew && !lab) {
    return (
      <div className="p-6">
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('adminLab.not_found')}</h1>
          <Link to="/admin/labs" className="btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('admin.back_to_list')}
          </Link>
        </div>
      </div>
    );
  }

  const title = isNew ? t('adminD.units.new_lab_title') : (lab?.nameUz ?? '');
  const comp = lab ? labCompleteness(lab) : null;
  const nameFilled = (l: Suffix) => Boolean((values[`name${l}` as keyof FormData] as string)?.trim());
  const langHasError = (l: Suffix) =>
    Boolean(errors[`name${l}` as keyof FormData]);
  const dirList = (values[`directions${lang}` as keyof FormData] as string)
    .split('\n').map((s) => s.trim()).filter(Boolean);
  const errText = (key: keyof FormData) => {
    const m = errors[key]?.message;
    return m ? t(m) : null;
  };

  const tabs: Array<{ key: TabKey; label: string; disabled?: boolean }> = [
    { key: 'info', label: t('adminLab.tab_info') },
    { key: 'staff', label: t('adminLab.tab_staff', { count: staff.length }), disabled: isNew },
  ];
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (isNew || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    const next: TabKey = tab === 'info' ? 'staff' : 'info';
    setTab(next);
    document.getElementById(`lab-tab-${next}`)?.focus();
  };

  return (
    <>
      <Helmet><title>{title} | Admin</title></Helmet>
      <div className="p-6">
        {/* Hero */}
        <header className="card mb-6 overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-primary-600 to-primary-900 sm:h-52">
            {values.imageUrl ? (
              <img src={fileUrl(values.imageUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              <FlaskConical className="absolute inset-0 m-auto h-16 w-16 text-white/30" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <Link
              to="/admin/labs"
              className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('admin.labs')}
            </Link>
            {!isNew && (
              <a
                href={`/uz/laboratories/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900"
              >
                {t('adminLab.view_site')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{t('adminLab.new_tab')}</span>
              </a>
            )}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h1 className="text-2xl font-bold leading-tight text-white drop-shadow sm:text-3xl">{title}</h1>
              {isNew && <p className="mt-1 text-sm text-white/80">{t('adminLab.new_subtitle')}</p>}
            </div>
          </div>
          {!isNew && lab && comp && (
            <dl className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-4 sm:divide-y-0">
              {[
                { icon: Users, label: t('adminLab.stat_staff'), value: String(staff.length) },
                { icon: ListChecks, label: t('adminLab.stat_directions'), value: String(countLines(lab.directionsUz)) },
                { icon: CalendarDays, label: t('adminLab.stat_year'), value: lab.foundedYear ? String(lab.foundedYear) : '—' },
                { icon: Check, label: t('adminLab.completeness'), value: `${comp.done}/${comp.total}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3">
                  <Icon className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-600 dark:text-gray-400">{label}</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </header>

        {/* Yorliqlar */}
        <div role="tablist" aria-label={title} className="mb-5 flex gap-1 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              id={`lab-tab-${tb.key}`}
              type="button"
              role="tab"
              aria-selected={tab === tb.key}
              aria-controls={`lab-panel-${tb.key}`}
              tabIndex={tab === tb.key ? 0 : -1}
              disabled={tb.disabled}
              title={tb.disabled ? t('adminLab.staff_locked') : undefined}
              onClick={() => setTab(tb.key)}
              onKeyDown={onTabKey}
              className={clsx(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                tab === tb.key
                  ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Ma'lumotlar */}
        <div id="lab-panel-info" role="tabpanel" aria-labelledby="lab-tab-info" hidden={tab !== 'info'}>
          <form onSubmit={handleSubmit((v) => saveMut.mutate(v), onInvalid)} noValidate className="space-y-5">
            {/* Til almashtirgich */}
            <div className="card flex flex-wrap items-center gap-3 p-3">
              <span className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300" id="lab-lang-label">{t('adminLab.language')}</span>
              <div role="group" aria-labelledby="lab-lang-label" className="flex flex-wrap gap-2">
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
                        : langHasError(l.key)
                          ? 'border-red-400 text-red-700 hover:bg-red-50 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-950'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
                    )}
                  >
                    {l.label}
                    {langHasError(l.key) ? (
                      <AlertCircle className="h-4 w-4" aria-label={t('adminLab.lang_error')} />
                    ) : nameFilled(l.key) ? (
                      <Check className="h-4 w-4" aria-label={t('admin.filled')} />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-400" role="img" aria-label={t('admin.empty_tab')} />
                    )}
                  </button>
                ))}
              </div>
              {lang !== 'Uz' && (
                <button
                  type="button"
                  onClick={() => {
                    setValue(`name${lang}` as keyof FormData, values.nameUz, { shouldDirty: true });
                    setValue(`description${lang}` as keyof FormData, values.descriptionUz, { shouldDirty: true });
                    setValue(`directions${lang}` as keyof FormData, values.directionsUz, { shouldDirty: true });
                    setValue(`content${lang}` as keyof FormData, values.contentUz, { shouldDirty: true });
                  }}
                  className="ml-auto text-xs font-medium text-primary-700 hover:underline dark:text-primary-300"
                >
                  {t('admin.copy_from_uz')}
                </button>
              )}
            </div>

            <FormSection title={t('adminLab.sec_main')} description={t('adminLab.sec_main_desc')} icon={Info}>
              {LANGS.map((l) => (
                <div key={l.key} className={lang === l.key ? 'space-y-4' : 'hidden'}>
                  <div>
                    <label htmlFor={`lab-name-${l.key}`} className="label">{t('adminD.units.name_lang', { lang: l.key.toUpperCase() })} *</label>
                    <input
                      id={`lab-name-${l.key}`}
                      {...register(`name${l.key}` as 'nameUz')}
                      className="input"
                      aria-invalid={Boolean(errors[`name${l.key}` as keyof FormData])}
                      aria-describedby={errors[`name${l.key}` as keyof FormData] ? `lab-name-${l.key}-err` : undefined}
                    />
                    {errText(`name${l.key}` as keyof FormData) && (
                      <p id={`lab-name-${l.key}-err`} className="mt-1 flex items-center gap-1 text-sm text-red-700 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errText(`name${l.key}` as keyof FormData)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`lab-desc-${l.key}`} className="label">{t('adminLab.summary')} ({l.key.toUpperCase()})</label>
                    <textarea id={`lab-desc-${l.key}`} {...register(`description${l.key}` as 'descriptionUz')} rows={3} className="input resize-none" />
                  </div>
                </div>
              ))}
              <div className="max-w-[12rem]">
                <label htmlFor="lab-order" className="label">{t('adminD.units.order')}</label>
                <input id="lab-order" type="number" {...register('order')} className="input" aria-invalid={Boolean(errors.order)} />
                {errText('order') && <p className="mt-1 text-sm text-red-700 dark:text-red-400">{errText('order')}</p>}
              </div>
            </FormSection>

            <FormSection title={t('adminLab.sec_cover')} description={t('adminLab.sec_cover_desc')} icon={ImageIcon}>
              <FileUploadField
                kind="image"
                label={t('adminLab.cover_label')}
                value={values.imageUrl || null}
                onChange={(url) => setValue('imageUrl', url ?? '', { shouldDirty: true })}
                ownerType="structure"
                ownerId={isNew ? undefined : id}
              />
            </FormSection>

            <FormSection title={t('adminLab.sec_directions')} description={t('adminLab.sec_directions_desc')} icon={ListChecks}>
              {LANGS.map((l) => (
                <div key={l.key} className={lang === l.key ? '' : 'hidden'}>
                  <label htmlFor={`lab-dir-${l.key}`} className="label">{t('adminLab.directions_label', { lang: l.key.toUpperCase() })}</label>
                  <textarea
                    id={`lab-dir-${l.key}`}
                    {...register(`directions${l.key}` as 'directionsUz')}
                    rows={5}
                    aria-describedby="lab-dir-hint"
                    className="input"
                  />
                </div>
              ))}
              <p id="lab-dir-hint" className="text-xs text-gray-600 dark:text-gray-400">{t('adminLab.directions_hint')}</p>
              <div aria-live="polite">
                <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">{t('adminLab.preview')} ({dirList.length})</p>
                {dirList.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('adminLab.no_directions')}</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {dirList.map((d, i) => (
                      <li key={`${i}-${d}`} className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-900 dark:bg-primary-900/30 dark:text-primary-100">{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </FormSection>

            <FormSection title={t('adminLab.sec_about')} description={t('adminLab.sec_about_desc')} icon={BookOpen}>
              {LANGS.map((l) => (
                <div key={l.key} className={lang === l.key ? '' : 'hidden'}>
                  <p className="label">{t('adminLab.about_label', { lang: l.key.toUpperCase() })}</p>
                  <RichTextEditor
                    value={(values[`content${l.key}` as keyof FormData] as string) ?? ''}
                    onChange={(html) => setValue(`content${l.key}` as keyof FormData, html, { shouldDirty: true })}
                    ownerType="structure"
                    ownerId={isNew ? undefined : id}
                  />
                </div>
              ))}
            </FormSection>

            <FormSection title={t('adminLab.sec_contact')} icon={Phone}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lab-room" className="label">{t('adminLab.room')}</label>
                  <input id="lab-room" {...register('room')} className="input" />
                </div>
                <div>
                  <label htmlFor="lab-phone" className="label">{t('adminLab.phone')}</label>
                  <input id="lab-phone" type="tel" {...register('phone')} className="input" />
                </div>
                <div>
                  <label htmlFor="lab-email" className="label">{t('adminLab.email')}</label>
                  <input
                    id="lab-email" type="email" {...register('email')} className="input"
                    aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'lab-email-err' : undefined}
                  />
                  {errText('email') && (
                    <p id="lab-email-err" className="mt-1 flex items-center gap-1 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errText('email')}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lab-year" className="label">{t('adminLab.year')}</label>
                  <input
                    id="lab-year" inputMode="numeric" maxLength={4} {...register('foundedYear')} className="input"
                    aria-invalid={Boolean(errors.foundedYear)} aria-describedby={errors.foundedYear ? 'lab-year-err' : undefined}
                  />
                  {errText('foundedYear') && (
                    <p id="lab-year-err" className="mt-1 flex items-center gap-1 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" /> {errText('foundedYear')}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
              {isDirty && <span className="mr-auto text-sm text-amber-700 dark:text-amber-400" role="status">{t('adminLab.unsaved')}</span>}
              <Link to="/admin/labs" className={clsx('btn-secondary', !isDirty && 'mr-auto')}>{t('admin.cancel')}</Link>
              <button type="submit" disabled={saveMut.isPending} className="btn-primary gap-2">
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isNew ? t('adminLab.create') : t('admin.save')}
              </button>
            </div>
          </form>
        </div>

        {/* Xodimlar */}
        {!isNew && lab && (
          <div id="lab-panel-staff" role="tabpanel" aria-labelledby="lab-tab-staff" hidden={tab !== 'staff'}>
            <StaffPanel
              staff={staff}
              others={employees.filter((e) => e.labId !== lab.id)}
              busy={staffMut.isPending}
              onNew={() => setStaffForm({ employee: null })}
              onEdit={(e) => setStaffForm({ employee: e })}
              onToggleHead={toggleHead}
              onDetach={detach}
              onAttach={(emp) => staffMut.mutate(() => employeesApi.update(emp.id, { labId: lab.id }))}
            />
          </div>
        )}
      </div>
    </>
  );
}

interface StaffProps {
  staff: Employee[];
  others: Employee[];
  busy: boolean;
  onNew: () => void;
  onEdit: (e: Employee) => void;
  onToggleHead: (e: Employee) => void;
  onDetach: (e: Employee) => void;
  onAttach: (e: Employee) => void;
}

function StaffPanel({ staff, others, busy, onNew, onEdit, onToggleHead, onDetach, onAttach }: StaffProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [pick, setPick] = useState('');

  const q = query.trim().toLowerCase();
  const options = others.filter((e) => !q || e.fullNameUz.toLowerCase().includes(q) || e.fullNameEn.toLowerCase().includes(q));
  const sorted = [...staff].sort((a, b) => Number(b.isUnitHead) - Number(a.isUnitHead) || a.order - b.order);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="lab-attach-q" className="label">{t('adminLab.attach_search')}</label>
          <input id="lab-attach-q" value={query} onChange={(e) => { setQuery(e.target.value); setPick(''); }} className="input" placeholder={t('adminLab.attach_placeholder')} />
        </div>
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="lab-attach-select" className="label">{t('adminD.units.attach_label')}</label>
          <select id="lab-attach-select" value={pick} onChange={(e) => setPick(e.target.value)} className="input">
            <option value="">{t('adminD.units.attach_none')}</option>
            {options.map((e) => <option key={e.id} value={e.id}>{e.fullNameUz} — {e.positionUz}</option>)}
          </select>
        </div>
        <button
          type="button"
          disabled={!pick || busy}
          onClick={() => { const emp = others.find((e) => e.id === pick); if (emp) { onAttach(emp); setPick(''); setQuery(''); } }}
          className="btn-secondary gap-2"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" /> {t('adminD.units.attach_btn')}
        </button>
        <button type="button" onClick={onNew} className="btn-primary gap-2">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> {t('adminLab.new_employee')}
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminD.units.no_lab_staff')}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {sorted.map((e) => (
            <li key={e.id} className={clsx('card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md', !e.isActive && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-base font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                  {e.photoUrl ? <img src={fileUrl(e.photoUrl)} alt="" loading="lazy" className="h-full w-full object-cover" /> : initials(e.fullNameUz)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-gray-900 dark:text-gray-100">{e.fullNameUz}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{e.positionUz}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {e.isUnitHead && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                        <Crown className="h-3 w-3" aria-hidden="true" /> {t('adminLab.head')}
                      </span>
                    )}
                    {!e.isActive && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">{t('adminLab.inactive')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button type="button" onClick={() => onEdit(e)} className="btn-secondary gap-1.5 !px-3 !py-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t('adminLab.edit_employee')}
                </button>
                <button type="button" disabled={busy} onClick={() => onToggleHead(e)} className="btn-secondary gap-1.5 !px-3 !py-1.5 text-xs">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" /> {e.isUnitHead ? t('adminLab.remove_head') : t('adminLab.make_head')}
                </button>
                <button
                  type="button" disabled={busy} onClick={() => onDetach(e)}
                  className="btn-secondary gap-1.5 !px-3 !py-1.5 text-xs text-red-700 hover:!bg-red-50 dark:text-red-300 dark:hover:!bg-red-950"
                >
                  <UserMinus className="h-3.5 w-3.5" aria-hidden="true" /> {t('adminLab.detach')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
