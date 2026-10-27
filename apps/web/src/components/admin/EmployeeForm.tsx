import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users } from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi } from '@/lib/api';
import type { Employee } from '@/lib/employee';
import { type Unit } from '@/lib/structure';
import FileUploadField from '@/components/admin/FileUploadField';
import { useToast } from '@/components/Toast';
import AdminFormPage from '@/components/admin/AdminFormPage';

export const employeeSchema = z.object({
  fullNameUz: z.string().min(1, 'adminC.employees.err_name'),
  fullNameEn: z.string().min(1, 'adminC.employees.err_name'),
  fullNameRu: z.string().min(1, 'adminC.employees.err_name'),
  positionUz: z.string().min(1, 'adminC.employees.err_position'),
  positionEn: z.string().min(1, 'adminC.employees.err_position'),
  positionRu: z.string().min(1, 'adminC.employees.err_position'),
  degreeUz: z.string().optional(), degreeEn: z.string().optional(), degreeRu: z.string().optional(),
  titleUz: z.string().optional(), titleEn: z.string().optional(), titleRu: z.string().optional(),
  researchAreaUz: z.string().optional(), researchAreaEn: z.string().optional(), researchAreaRu: z.string().optional(),
  receptionHoursUz: z.string().optional(), receptionHoursEn: z.string().optional(), receptionHoursRu: z.string().optional(),
  email: z.string().email('adminC.employees.err_email').optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  orcid: z.string().optional(),
  scopusId: z.string().optional(),
  officeRoom: z.string().optional(),
  unitId: z.string().optional(),
  labId: z.string().optional(),
  order: z.coerce.number().int().optional(),
  isManagement: z.boolean().optional(),
  isUnitHead: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export type EmployeeFormData = z.infer<typeof employeeSchema>;

const TABS = [
  { key: 'Uz', label: "O'zbek" },
  { key: 'En', label: 'English' },
  { key: 'Ru', label: 'Русский' },
] as const;


/** Daraxtni tekis ro'yxatga aylantiradi — biriktirish uchun ro'yxat. */
function flatten(units: Unit[], depth = 0): Array<{ unit: Unit; depth: number }> {
  return units.flatMap((unit) => [{ unit, depth }, ...flatten(unit.children ?? [], depth + 1)]);
}

interface Props {
  employee?: Employee | null;
  presetLabId?: string;
  lockLab?: boolean;
  onClose: () => void;
  onSaved?: (saved: Employee) => void;
}

export default function EmployeeForm({ employee, presetLabId, lockLab, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'Uz' | 'En' | 'Ru'>('Uz');

  const { data: structureData } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });
  const units = flatten((structureData?.data?.data ?? []) as Unit[]).map(({ unit }) => unit);
  // Bo'lim va laboratoriya mustaqil tanlanadi.
  const sections = units.filter((unit) => unit.type === 'section');
  const labs = units.filter((unit) => unit.type === 'laboratory');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? (Object.fromEntries(
          Object.entries(employee).filter(([, value]) => value !== null && value !== undefined),
        ) as Partial<EmployeeFormData>)
      : undefined,
  });
  const photoUrl = watch('photoUrl');

  // Select qiymati faqat variantlar (laboratoriyalar) yuklangandan keyin o'rnatiladi.
  const [pendingLab, setPendingLab] = useState<string | null>(employee ? null : presetLabId ?? null);
  useEffect(() => {
    if (!pendingLab || !labs.some((lab) => lab.id === pendingLab)) return;
    setValue('labId', pendingLab);
    setPendingLab(null);
  }, [pendingLab, labs, setValue]);

  const handleClose = () => { setActiveTab('Uz'); onClose(); };

  const onDone = (res: { data: { data: Employee } }) => {
    qc.invalidateQueries({ queryKey: ['admin-employees'] });
    qc.invalidateQueries({ queryKey: ['employees'] });
    toast.success(t('toast.employee_saved'));
    handleClose();
    onSaved?.(res.data?.data);
  };
  const createMutation = useMutation({
    mutationFn: (values: EmployeeFormData) => employeesApi.create(values),
    onSuccess: onDone,
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<EmployeeFormData> }) => employeesApi.update(id, values),
    onSuccess: onDone,
    onError: (error) => toast.showError(error),
  });

  const onSubmit = (raw: EmployeeFormData) => {
    // Laboratoriya qulflangan bo'lsa, doim shu laboratoriyaga biriktiriladi.
    const values = lockLab ? { ...raw, labId: presetLabId ?? employee?.labId ?? undefined } : raw;
    if (employee) updateMutation.mutate({ id: employee.id, values });
    else createMutation.mutate(values);
  };

  return (
  <AdminFormPage
    title={`${employee ? t('admin.edit') : t('admin.add_new')} — ${t('admin.employees')}`}
    subtitle={t('admin.modal_subtitle')}
    icon={Users}
    size="lg"
    onClose={handleClose}
    onSubmit={handleSubmit(onSubmit)}
    footer={
      <>
        <button type="button" onClick={handleClose} className="btn-secondary sm:mr-auto">
          {t('admin.cancel')}
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="btn-primary"
        >
          {t('admin.save')}
        </button>
      </>
    }
  >
    <div className="flex gap-1 border-b dark:border-gray-800">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.key
              ? 'border-primary-600 text-primary-700 dark:border-primary-300 dark:text-primary-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {TABS.map((tab) => (
      <div key={tab.key} className={clsx('space-y-3', activeTab === tab.key ? '' : 'hidden')}>
        <div>
          <label className="label">{t('adminC.employees.fullname_label', { lang: tab.key.toUpperCase() })}</label>
          <input {...register(`fullName${tab.key}` as keyof EmployeeFormData)} className="input" />
          {errors[`fullName${tab.key}` as keyof EmployeeFormData] && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              {t(errors[`fullName${tab.key}` as keyof EmployeeFormData]?.message as string)}
            </p>
          )}
        </div>
        <div>
          <label className="label">{t('adminC.employees.position_label', { lang: tab.key.toUpperCase() })}</label>
          <input {...register(`position${tab.key}` as keyof EmployeeFormData)} className="input" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t('adminC.employees.degree_label', { lang: tab.key.toUpperCase() })}</label>
            <input {...register(`degree${tab.key}` as keyof EmployeeFormData)} className="input" />
          </div>
          <div>
            <label className="label">{t('adminC.employees.title_label', { lang: tab.key.toUpperCase() })}</label>
            <input {...register(`title${tab.key}` as keyof EmployeeFormData)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">{t('adminC.employees.research_label', { lang: tab.key.toUpperCase() })}</label>
          <input {...register(`researchArea${tab.key}` as keyof EmployeeFormData)} className="input" />
        </div>
        <div>
          <label className="label">{t('adminC.employees.reception_label', { lang: tab.key.toUpperCase() })}</label>
          <input
            {...register(`receptionHours${tab.key}` as keyof EmployeeFormData)}
            className="input"
            placeholder={t('adminC.employees.reception_placeholder')}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('adminC.employees.reception_hint')}
          </p>
        </div>
      </div>
    ))}

    {/*
      Shaxsiy ma'lumotlar bo'yicha ogohlantirish — 06-topshiriq talabi.
    */}
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/30 p-4 space-y-3">
      <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
        <span className="font-semibold">{t('adminC.common.attention')}</span> {t('adminC.employees.warn_before')}{' '}
        <span className="font-semibold">{t('adminC.employees.warn_bold')}</span>{' '}
        {t('adminC.employees.warn_after')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t('adminC.employees.phone')}</label>
          <input {...register('phone')} className="input" placeholder="+998 71 ..." />
        </div>
        <div>
          <label className="label">{t('adminC.employees.email')}</label>
          <input {...register('email')} className="input" placeholder="ism@iep.uz" />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{t(errors.email.message as string)}</p>}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="label">{t('adminC.employees.office')}</label>
        <input {...register('officeRoom')} className="input" />
      </div>
      <div className="sm:col-span-2">
        <FileUploadField
          kind="photo"
          label={t('adminC.employees.photo')}
          value={photoUrl ?? null}
          onChange={(url) => setValue('photoUrl', url ?? '', { shouldDirty: true })}
          ownerType="employee"
          ownerId={employee?.id}
        />
      </div>
      <div>
        <label className="label">ORCID</label>
        <input {...register('orcid')} className="input" placeholder="0000-0000-0000-0000" />
      </div>
      <div>
        <label className="label">Scopus Author ID</label>
        <input {...register('scopusId')} className="input" />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="emp-unit" className="label">{t('adminC.employees.unit')}</label>
        <select id="emp-unit" {...register('unitId')} className="input">
          <option value="">{t('adminC.employees.unit_none')}</option>
          {sections.map((unit) => (
            <option key={unit.id} value={unit.id}>{unit.nameUz}</option>
          ))}
        </select>
      </div>
      {!lockLab && (
        <div>
          <label htmlFor="emp-lab" className="label">{t('adminC.employees.lab')}</label>
          <select id="emp-lab" {...register('labId')} className="input">
            <option value="">{t('adminC.employees.lab_none')}</option>
            {labs.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.nameUz}</option>
            ))}
          </select>
        </div>
      )}
    </div>

    <div>
      <label htmlFor="emp-order" className="label">{t('adminC.common.order_number')}</label>
      <input id="emp-order" type="number" {...register('order')} className="input" defaultValue={0} />
    </div>

    <div className="flex flex-wrap gap-5 pt-1">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" {...register('isManagement')} className="rounded" />
        {t('adminC.employees.is_management')}
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" {...register('isUnitHead')} className="rounded" />
        {t('adminC.employees.is_unit_head')}
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" {...register('isActive')} defaultChecked className="rounded" />
        {t('adminC.employees.active')}
      </label>
    </div>
  </AdminFormPage>
  );
}
