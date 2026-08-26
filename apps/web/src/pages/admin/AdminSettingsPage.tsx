import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { settingsApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

const SETTING_KEYS = [
  { key: 'site_name_uz', label: 'Sayt nomi (UZ)', group: 'general' },
  { key: 'site_name_en', label: 'Sayt nomi (EN)', group: 'general' },
  { key: 'site_name_ru', label: 'Sayt nomi (RU)', group: 'general' },
  { key: 'site_url', label: 'Sayt manzili (canonical/hreflang uchun)', group: 'general' },
  { key: 'address_uz', label: 'Manzil (UZ)', group: 'contact' },
  { key: 'address_en', label: 'Manzil (EN)', group: 'contact' },
  { key: 'address_ru', label: 'Manzil (RU)', group: 'contact' },
  { key: 'phone', label: 'Telefon', group: 'contact' },
  { key: 'email', label: 'Email', group: 'contact' },
  { key: 'working_hours', label: 'Ish vaqti', group: 'contact' },
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
  const groupLabels: Record<string, string> = { general: 'Umumiy', contact: 'Aloqa ma\'lumotlari' };

  return (
    <>
      <Helmet><title>Sozlamalar | Admin</title></Helmet>
      <div className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings')}</h1>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" /> Saqlandi!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          {groups.map((group) => (
            <div key={group} className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">{groupLabels[group]}</h2>
              <div className="space-y-4">
                {SETTING_KEYS.filter((s) => s.group === group).map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input {...register(key)} className="input" />
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
            {mutation.isPending ? 'Saqlanmoqda...' : t('admin.save')}
          </button>
        </form>
      </div>
    </>
  );
}
