import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { settingsApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

/**
 * Manzil, telefon va ish vaqti endi STATIK (`apps/web/src/config/contact.ts`)
 * — shu ro'yxatda YO'Q, chunki bu yerda o'zgartirilsa ham saytda ko'rinmaydi.
 * O'zgartirish kerak bo'lsa kod orqali (`config/contact.ts`).
 *
 * `email` bu yerda qoladi: sayt aloqa emaili emas, balki murojaat
 * bildirishnomalari uchun ZAXIRA manzil (`appeals_email` bo'sh bo'lganda
 * ishlatiladi — `apps/api/src/routes/contact.ts`).
 */
const SETTING_KEYS = [
  { key: 'site_name_uz', labelKey: 'adminD.settings.site_name_uz', group: 'general' },
  { key: 'site_name_en', labelKey: 'adminD.settings.site_name_en', group: 'general' },
  { key: 'site_name_ru', labelKey: 'adminD.settings.site_name_ru', group: 'general' },
  { key: 'site_url', labelKey: 'adminD.settings.site_url', group: 'general' },
  { key: 'email', labelKey: 'adminD.settings.email', group: 'contact' },
  { key: 'appeals_email', labelKey: 'adminD.settings.appeals_email', group: 'contact' },
  { key: 'appeals_retention_days', labelKey: 'adminD.settings.appeals_retention_days', group: 'contact' },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.all() });
  const settings: Record<string, string> = data?.data?.data ?? {};

  const { register, handleSubmit, reset } = useForm<Record<string, string>>();

  useEffect(() => {
    if (Object.keys(settings).length > 0) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (d: Record<string, string>) => settingsApi.bulkUpdate(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const groups = ['general', 'contact'];
  const groupLabels: Record<string, string> = {
    general: t('adminD.settings.group_general'),
    contact: t('adminD.settings.group_contact'),
  };

  return (
    <>
      <Helmet><title>{t('adminD.settings.helmet')}</title></Helmet>
      <div className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.settings')}</h1>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 text-sm font-medium">
              <CheckCircle className="h-4 w-4" aria-hidden="true" /> {t('adminD.settings.saved')}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          {groups.map((group) => (
            <div key={group} className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b dark:border-gray-800">{groupLabels[group]}</h2>
              <div className="space-y-4">
                {SETTING_KEYS.filter((s) => s.group === group).map(({ key, labelKey }) => (
                  <div key={key}>
                    <label htmlFor={`setting-${key}`} className="label">{t(labelKey)}</label>
                    <input id={`setting-${key}`} {...register(key)} className="input" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary gap-2"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? t('adminD.settings.saving') : t('admin.save')}
          </button>
        </form>
      </div>
    </>
  );
}
