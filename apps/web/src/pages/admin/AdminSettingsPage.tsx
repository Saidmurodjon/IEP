import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Save, Mail, Globe, type LucideIcon } from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';

/**
 * Faqat HAQIQATAN ishlatiladigan sozlamalar:
 * - `appeals_email` — murojaat bildirishnomalari (`routes/contact.ts`);
 * - `appeals_retention_days` — yopilgan murojaatlarni tozalash muddati;
 * - `site_url` — canonical/hreflang va xatlardagi havola.
 *
 * Sayt nomi i18n'dan olinadi, manzil/telefon `config/contact.ts` da,
 * «Institut haqida» matnlari — `/admin/about`. Eski `email` kaliti API'da
 * zaxira sifatida qoladi; bu yerda bitta maydonga birlashtirilgan.
 */
interface Field {
  key: string;
  type: 'email' | 'number' | 'url';
}

const GROUPS: ReadonlyArray<{ id: string; icon: LucideIcon; fields: Field[] }> = [
  {
    id: 'appeals',
    icon: Mail,
    fields: [
      { key: 'appeals_email', type: 'email' },
      { key: 'appeals_retention_days', type: 'number' },
    ],
  },
  {
    id: 'site',
    icon: Globe,
    fields: [{ key: 'site_url', type: 'url' }],
  },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();

  const { data } = useQuery({ queryKey: ['settings', 'private'], queryFn: () => settingsApi.private() });
  const settings: Record<string, string> | undefined = data?.data?.data;

  const { register, handleSubmit, reset } = useForm<Record<string, string>>();

  useEffect(() => {
    if (!settings) return;
    reset({
      appeals_email: settings.appeals_email || settings.email || '',
      appeals_retention_days: settings.appeals_retention_days || '365',
      site_url: settings.site_url ?? '',
    });
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (d: Record<string, string>) => settingsApi.bulkUpdate(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('adminD.settings.saved'));
    },
    onError: (error) => toast.showError(error),
  });

  return (
    <>
      <Helmet><title>{t('adminD.settings.helmet')}</title></Helmet>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.settings')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('adminD.settings.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          {GROUPS.map(({ id, icon: Icon, fields }) => (
            <section key={id} className="card p-5" aria-labelledby={`settings-${id}`}>
              <div className="mb-5 flex items-start gap-3 border-b pb-4 dark:border-gray-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id={`settings-${id}`} className="font-semibold text-gray-900 dark:text-gray-100">
                    {t(`adminD.settings.group_${id}`)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(`adminD.settings.group_${id}_desc`)}</p>
                </div>
              </div>
              <div className="space-y-5">
                {fields.map(({ key, type }) => (
                  <div key={key}>
                    <label htmlFor={`setting-${key}`} className="label">{t(`adminD.settings.${key}`)}</label>
                    <input
                      id={`setting-${key}`}
                      type={type}
                      min={type === 'number' ? 30 : undefined}
                      aria-describedby={`setting-${key}-hint`}
                      {...register(key)}
                      className="input"
                    />
                    <p id={`setting-${key}-hint`} className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {t(`adminD.settings.${key}_hint`)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <button type="submit" disabled={mutation.isPending} className="btn-primary gap-2">
            <Save className="h-4 w-4" aria-hidden="true" />
            {mutation.isPending ? t('adminD.settings.saving') : t('admin.save')}
          </button>
        </form>
      </div>
    </>
  );
}
