import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/Toast';
import FieldError from '@/components/FieldError';

interface MeDto {
  id: string;
  email: string;
  name: string;
  role?: 'SUPER_ADMIN' | 'ADMIN';
  lastLoginAt?: string | null;
}

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const admin = useAuthStore((s) => s.admin);
  const updateAdmin = useAuthStore((s) => s.updateAdmin);

  const { data } = useQuery({ queryKey: ['admin-me'], queryFn: () => authApi.me() });
  const me: MeDto | undefined = data?.data?.data;

  const nameSchema = useMemo(
    () => z.object({ name: z.string().trim().min(2, t('profile.v_name')).max(100, t('profile.v_name')) }),
    [t]
  );
  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t('profile.v_current')),
          newPassword: z.string().min(10, t('profile.v_new')).max(200, t('profile.v_new')),
          confirmPassword: z.string().min(1, t('profile.v_confirm')),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          path: ['confirmPassword'],
          message: t('profile.v_mismatch'),
        }),
    [t]
  );

  const nameForm = useForm<{ name: string }>({
    resolver: zodResolver(nameSchema),
    values: { name: me?.name ?? admin?.name ?? '' },
  });
  const passForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const nameMutation = useMutation({
    mutationFn: (name: string) => authApi.updateMe(name),
    onSuccess: (res) => {
      const updated: MeDto | undefined = res.data?.data;
      const current = useAuthStore.getState().admin;
      if (current) updateAdmin({ ...current, name: updated?.name ?? nameForm.getValues('name').trim() });
      toast.success(t('profile.name_saved'));
    },
    onError: (error) => toast.showError(error),
  });
  const passMutation = useMutation({
    mutationFn: (v: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(v.currentPassword, v.newPassword),
    onSuccess: () => {
      passForm.reset();
      toast.success(t('profile.password_saved'));
    },
    onError: (error) => toast.showError(error),
  });

  const role = me?.role ?? admin?.role;
  const lastLogin = me?.lastLoginAt ? formatDateTime(me.lastLoginAt) : t('profile.never');
  const pe = passForm.formState.errors;
  const ne = nameForm.formState.errors;

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-6">
      <Helmet>
        <title>{t('profile.title')}</title>
      </Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>

      <section className="card p-5" aria-labelledby="profile-info-h">
        <h2 id="profile-info-h" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('profile.info')}
        </h2>
        <form onSubmit={nameForm.handleSubmit((v) => nameMutation.mutate(v.name.trim()))} noValidate className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="label">{t('profile.name')}</label>
            <input
              id="profile-name"
              className="input"
              autoComplete="name"
              aria-invalid={!!ne.name}
              aria-describedby="profile-name-err"
              {...nameForm.register('name')}
            />
            <FieldError id="profile-name-err" message={ne.name?.message} />
          </div>
          <div>
            <label htmlFor="profile-email" className="label">{t('profile.email')}</label>
            <input id="profile-email" className="input opacity-70" value={me?.email ?? admin?.email ?? ''} readOnly />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="label">{t('profile.role')}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{role ? t(`usersPage.role_${role}`) : '—'}</dd>
            </div>
            <div>
              <dt className="label">{t('profile.last_login')}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{lastLogin}</dd>
            </div>
          </dl>
          <button type="submit" className="btn btn-primary" disabled={nameMutation.isPending}>
            {t('admin.save')}
          </button>
        </form>
      </section>

      <section className="card p-5" aria-labelledby="profile-pass-h">
        <h2 id="profile-pass-h" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('profile.change_password')}
        </h2>
        <form
          onSubmit={passForm.handleSubmit((v) =>
            passMutation.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword })
          )}
          noValidate
          className="space-y-4"
        >
          <div>
            <label htmlFor="profile-current" className="label">{t('profile.current_password')}</label>
            <input
              id="profile-current"
              type="password"
              className="input"
              autoComplete="current-password"
              aria-invalid={!!pe.currentPassword}
              aria-describedby="profile-current-err"
              {...passForm.register('currentPassword')}
            />
            <FieldError id="profile-current-err" message={pe.currentPassword?.message} />
          </div>
          <div>
            <label htmlFor="profile-new" className="label">{t('profile.new_password')}</label>
            <input
              id="profile-new"
              type="password"
              className="input"
              autoComplete="new-password"
              aria-invalid={!!pe.newPassword}
              aria-describedby="profile-new-hint profile-new-err"
              {...passForm.register('newPassword')}
            />
            <p id="profile-new-hint" className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('usersPage.password_hint')}</p>
            <FieldError id="profile-new-err" message={pe.newPassword?.message} />
          </div>
          <div>
            <label htmlFor="profile-confirm" className="label">{t('profile.confirm_password')}</label>
            <input
              id="profile-confirm"
              type="password"
              className="input"
              autoComplete="new-password"
              aria-invalid={!!pe.confirmPassword}
              aria-describedby="profile-confirm-err"
              {...passForm.register('confirmPassword')}
            />
            <FieldError id="profile-confirm-err" message={pe.confirmPassword?.message} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={passMutation.isPending}>
            {t('profile.change_password')}
          </button>
        </form>
      </section>
    </div>
  );
}
