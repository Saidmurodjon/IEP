import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, EyeOff, Eye } from 'lucide-react';
import clsx from 'clsx';
import { employeesApi, structureApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Employee } from '@/lib/employee';
import { type Unit } from '@/lib/structure';
import FileUploadField from '@/components/admin/FileUploadField';
import { useToast } from '@/components/Toast';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const schema = z.object({
  fullNameUz: z.string().min(1, 'Ism kiriting'),
  fullNameEn: z.string().min(1, 'Ism kiriting'),
  fullNameRu: z.string().min(1, 'Ism kiriting'),
  positionUz: z.string().min(1, 'Lavozim kiriting'),
  positionEn: z.string().min(1, 'Lavozim kiriting'),
  positionRu: z.string().min(1, 'Lavozim kiriting'),
  degreeUz: z.string().optional(), degreeEn: z.string().optional(), degreeRu: z.string().optional(),
  titleUz: z.string().optional(), titleEn: z.string().optional(), titleRu: z.string().optional(),
  researchAreaUz: z.string().optional(), researchAreaEn: z.string().optional(), researchAreaRu: z.string().optional(),
  receptionHoursUz: z.string().optional(), receptionHoursEn: z.string().optional(), receptionHoursRu: z.string().optional(),
  email: z.string().email("Pochta noto'g'ri").optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  orcid: z.string().optional(),
  scopusId: z.string().optional(),
  officeRoom: z.string().optional(),
  unitId: z.string().optional(),
  order: z.coerce.number().int().optional(),
  isManagement: z.boolean().optional(),
  isUnitHead: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const TABS = [
  { key: 'Uz', label: "O'zbek" },
  { key: 'En', label: 'English' },
  { key: 'Ru', label: 'Русский' },
] as const;

/** Daraxtni tekis ro'yxatga aylantiradi — biriktirish uchun ro'yxat. */
function flatten(units: Unit[], depth = 0): Array<{ unit: Unit; depth: number }> {
  return units.flatMap((unit) => [{ unit, depth }, ...flatten(unit.children ?? [], depth + 1)]);
}

export default function AdminEmployeesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'Uz' | 'En' | 'Ru'>('Uz');
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees'],
    // Admin panelda ishdan ketgan xodimlar ham ko'rinadi.
    queryFn: () => employeesApi.list(undefined, true),
  });
  const { data: structureData } = useQuery({
    queryKey: ['structure'],
    queryFn: () => structureApi.tree(),
  });

  const items: Employee[] = data?.data?.data ?? [];
  const units = flatten((structureData?.data?.data ?? []) as Unit[]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const photoUrl = watch('photoUrl');

  const closeForm = () => { setShowForm(false); setEditItem(null); setActiveTab('Uz'); reset(); };


  // Ochiq oynada fokus qamalib turadi va `Escape` uni yopadi (10B2).

  const formRef = useRef<HTMLDivElement>(null);

  useFocusTrap(formRef, showForm, closeForm);

  const createMutation = useMutation({
    mutationFn: (values: FormData) => employeesApi.create(values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<FormData> }) => employeesApi.update(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_saved')); closeForm(); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-employees'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(t('toast.employee_deleted')); },
    onError: (error) => toast.showError(error),
  });

  const openEdit = (item: Employee) => {
    setEditItem(item);
    Object.entries(item).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      setValue(key as keyof FormData, value as never);
    });
    setShowForm(true);
  };

  /** Ishdan ketgan xodim O'CHIRILMAYDI — `isActive` olib tashlanadi. */
  const toggleActive = (item: Employee) =>
    updateMutation.mutate({ id: item.id, values: { isActive: !item.isActive } });

  const onSubmit = (values: FormData) => {
    if (editItem) updateMutation.mutate({ id: editItem.id, values });
    else createMutation.mutate(values);
  };

  return (
    <>
      <Helmet><title>{t('admin.employees')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.employees')}</h1>
          <button onClick={() => { reset(); setEditItem(null); setShowForm(true); }} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> {t('admin.add_new')}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-2xl w-full max-w-3xl my-4"
              ref={formRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-form-title"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 id="admin-form-title" className="font-semibold text-gray-900">
                  {editItem ? t('admin.edit') : t('admin.add_new')} — {t('admin.employees')}
                </h2>
                <button onClick={closeForm} aria-label={t('common.close')} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div className="flex gap-1 border-b">
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
                  <div key={tab.key} className={clsx('space-y-3', activeTab === tab.key ? '' : 'hidden')}>
                    <div>
                      <label className="label">Ism-sharif ({tab.key.toUpperCase()}) *</label>
                      <input {...register(`fullName${tab.key}` as keyof FormData)} className="input" />
                      {errors[`fullName${tab.key}` as keyof FormData] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`fullName${tab.key}` as keyof FormData]?.message as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Lavozimi ({tab.key.toUpperCase()}) *</label>
                      <input {...register(`position${tab.key}` as keyof FormData)} className="input" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Ilmiy darajasi ({tab.key.toUpperCase()})</label>
                        <input {...register(`degree${tab.key}` as keyof FormData)} className="input" />
                      </div>
                      <div>
                        <label className="label">Ilmiy unvoni ({tab.key.toUpperCase()})</label>
                        <input {...register(`title${tab.key}` as keyof FormData)} className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Ilmiy yo'nalishi ({tab.key.toUpperCase()})</label>
                      <input {...register(`researchArea${tab.key}` as keyof FormData)} className="input" />
                    </div>
                    <div>
                      <label className="label">Qabul kunlari ({tab.key.toUpperCase()})</label>
                      <input
                        {...register(`receptionHours${tab.key}` as keyof FormData)}
                        className="input"
                        placeholder="Dushanba va chorshanba, 15:00 – 17:00"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Erkin matn. Bo'sh qoldirilsa, sahifada qabul vaqti qatori umuman ko'rinmaydi.
                      </p>
                    </div>
                  </div>
                ))}

                {/*
                  Shaxsiy ma'lumotlar bo'yicha ogohlantirish — 06-topshiriq talabi.
                */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-semibold">Diqqat.</span> Saytda faqat{' '}
                    <span className="font-semibold">xizmat telefoni va xizmat elektron pochtasi</span>{' '}
                    e'lon qilinadi. Shaxsiy mobil raqam yoki shaxsiy pochta manzilini kiritmang.
                    Ma'lumotni e'lon qilish uchun xodimning roziligi bo'lishi kerak.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Xizmat telefoni</label>
                      <input {...register('phone')} className="input" placeholder="+998 71 ..." />
                    </div>
                    <div>
                      <label className="label">Xizmat pochtasi</label>
                      <input {...register('email')} className="input" placeholder="ism@iep.uz" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Xona raqami</label>
                    <input {...register('officeRoom')} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <FileUploadField
                      kind="photo"
                      label="Xodim rasmi"
                      value={photoUrl ?? null}
                      onChange={(url) => setValue('photoUrl', url ?? '', { shouldDirty: true })}
                      ownerType="employee"
                      ownerId={editItem?.id}
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
                    <label className="label">Bo'linma / laboratoriya</label>
                    <select {...register('unitId')} className="input">
                      <option value="">— biriktirilmagan —</option>
                      {units.map(({ unit, depth }) => (
                        <option key={unit.id} value={unit.id}>
                          {' '.repeat(depth * 3)}{unit.nameUz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tartib raqami</label>
                    <input type="number" {...register('order')} className="input" defaultValue={0} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('isManagement')} className="rounded" />
                    Rahbariyat tarkibida
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('isUnitHead')} className="rounded" />
                    Bo'linma / laboratoriya mudiri
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('isActive')} defaultChecked className="rounded" />
                    Faol
                  </label>
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

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Ism-sharif</th>
                  <th className="text-left font-medium px-4 py-3">Lavozimi</th>
                  <th className="text-left font-medium px-4 py-3">Bo'linma</th>
                  <th className="text-left font-medium px-4 py-3">Tartib</th>
                  <th className="text-right font-medium px-4 py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      Xodimlar hali kiritilmagan.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className={clsx('border-t border-gray-100', !item.isActive && 'opacity-50')}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.fullNameUz}
                      {item.isManagement && <span className="ml-2 text-xs text-accent-700">rahbariyat</span>}
                      {item.isUnitHead && <span className="ml-2 text-xs text-primary-600">mudir</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.positionUz}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {units.find(({ unit }) => unit.id === item.unitId)?.unit.nameUz ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => toggleActive(item)}
                          title={item.isActive ? 'Nofaol qilish' : 'Faol qilish'}
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
