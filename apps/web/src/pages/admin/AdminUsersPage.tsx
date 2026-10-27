import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, KeyRound, Ban, CheckCircle2, UserCog } from 'lucide-react';
import clsx from 'clsx';
import { adminsApi, type AdminDto } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/date';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FieldError from '@/components/FieldError';
import { useToast } from '@/components/Toast';
import AdminFormModal from '@/components/admin/AdminFormModal';
import AdminFormPage from '@/components/admin/AdminFormPage';

type Role = AdminDto['role'];
const ROLES: Role[] = ['ADMIN', 'SUPER_ADMIN'];

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; item: AdminDto }
  | { kind: 'reset'; item: AdminDto }
  | { kind: 'delete'; item: AdminDto };

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const me = useAuthStore((s) => s.admin);
  const [modal, setModal] = useState<Modal | null>(null);
  const closeModal = () => setModal(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminsApi.list() });
  const items: AdminDto[] = data?.data?.data ?? [];

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  // Forma sxemalari — xabarlar tarjima kalitlaridan
  const nameField = z.string().trim().min(1, t('usersPage.v_name')).max(100, t('usersPage.v_name'));
  const passwordField = z.string().min(10, t('usersPage.v_password')).max(200, t('usersPage.v_password'));
  const roleField = z.enum(['SUPER_ADMIN', 'ADMIN']);
  const createSchema = z.object({
    name: nameField,
    email: z.string().trim().email(t('usersPage.v_email')),
    password: passwordField,
    role: roleField,
  });
  const editSchema = z.object({ name: nameField, role: roleField });
  const resetSchema = z.object({ password: passwordField });

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'ADMIN' },
  });
  const editForm = useForm<z.infer<typeof editSchema>>({ resolver: zodResolver(editSchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '' },
  });

  const done = (msg: string) => { refresh(); toast.success(msg); closeModal(); };

  const createMutation = useMutation({
    mutationFn: (v: z.infer<typeof createSchema>) => adminsApi.create(v),
    onSuccess: () => done(t('usersPage.created_ok')),
    onError: (e) => toast.showError(e),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { name?: string; role?: Role; isActive?: boolean } }) =>
      adminsApi.update(id, values),
    onSuccess: (_r, { values }) =>
      done(
        values.isActive === undefined
          ? t('usersPage.updated_ok')
          : values.isActive ? t('usersPage.unblocked_ok') : t('usersPage.blocked_ok')
      ),
    onError: (e) => toast.showError(e),
  });
  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => adminsApi.resetPassword(id, password),
    onSuccess: () => done(t('usersPage.reset_ok')),
    onError: (e) => toast.showError(e),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminsApi.remove(id),
    onSuccess: () => done(t('usersPage.deleted_ok')),
    onError: (e) => toast.showError(e),
  });

  const openCreate = () => { createForm.reset(); setModal({ kind: 'create' }); };
  const openEdit = (item: AdminDto) => {
    editForm.reset({ name: item.name, role: item.role });
    setModal({ kind: 'edit', item });
  };
  const openReset = (item: AdminDto) => { resetForm.reset({ password: '' }); setModal({ kind: 'reset', item }); };

  const iconBtn = 'p-2 text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:hover:text-gray-500';

  // Qo'shish/tahrirlash — ro'yxat o'rnida to'liq sahifa; parolni tiklash va
  // o'chirish tasdig'i esa kichik oyna bo'lib qoladi.
  const isFormPage = modal?.kind === 'create' || modal?.kind === 'edit';

  return (
    <>
      <Helmet><title>{t('usersPage.title')} | Admin</title></Helmet>
      <div className="p-6">
        {!isFormPage && (
          <>
            <div className="flex items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('usersPage.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('usersPage.subtitle')}</p>
              </div>
              <button type="button" onClick={openCreate} className="btn-primary gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" /> {t('usersPage.add')}
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.name')}</th>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.email')}</th>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.role')}</th>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.status')}</th>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.last_login')}</th>
                      <th scope="col" className="text-left font-medium px-4 py-3">{t('usersPage.created')}</th>
                      <th scope="col" className="text-right font-medium px-4 py-3">{t('usersPage.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-600 dark:text-gray-400">{t('usersPage.empty')}</td>
                      </tr>
                    )}
                    {items.map((item) => {
                      const isSelf = item.id === me?.id;
                      return (
                        <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                            {isSelf && (
                              <span className="ml-2 rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-normal text-gray-700 dark:text-gray-300">
                                {t('usersPage.you')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={clsx(
                                'rounded px-2 py-0.5 text-xs font-medium',
                                item.role === 'SUPER_ADMIN' ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              )}
                            >
                              {t(`usersPage.role_${item.role}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={clsx(
                                'inline-flex items-center gap-1 text-xs font-medium',
                                item.isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                              )}
                            >
                              {item.isActive
                                ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                : <Ban className="h-3.5 w-3.5" aria-hidden="true" />}
                              {item.isActive ? t('usersPage.active') : t('usersPage.blocked')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {item.lastLoginAt ? formatDateTime(item.lastLoginAt) : t('usersPage.never')}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button type="button" onClick={() => openEdit(item)} aria-label={`${t('usersPage.edit')}: ${item.name}`} title={t('usersPage.edit')} className={iconBtn}>
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button type="button" onClick={() => openReset(item)} aria-label={`${t('usersPage.reset')}: ${item.name}`} title={t('usersPage.reset')} className={iconBtn}>
                                <KeyRound className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={isSelf || updateMutation.isPending}
                                onClick={() => updateMutation.mutate({ id: item.id, values: { isActive: !item.isActive } })}
                                aria-label={`${item.isActive ? t('usersPage.block') : t('usersPage.unblock')}: ${item.name}`}
                                title={item.isActive ? t('usersPage.block') : t('usersPage.unblock')}
                                className={iconBtn}
                              >
                                {item.isActive
                                  ? <Ban className="h-4 w-4" aria-hidden="true" />
                                  : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                              </button>
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => setModal({ kind: 'delete', item })}
                                aria-label={`${t('usersPage.delete')}: ${item.name}`}
                                title={t('usersPage.delete')}
                                className={clsx(iconBtn, 'hover:text-red-700 dark:hover:text-red-300')}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {modal?.kind === 'create' && (
          <AdminFormPage
            title={t('usersPage.create_title')}
            icon={UserCog}
            size="md"
            onClose={closeModal}
            onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}
            footer={
              <>
                <button type="button" onClick={closeModal} className="btn-secondary sm:mr-auto">{t('admin.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">{t('admin.save')}</button>
              </>
            }
          >
            <div>
              <label htmlFor="user-name" className="label">{t('usersPage.name')} *</label>
              <input id="user-name" className="input" autoComplete="off"
                aria-invalid={!!createForm.formState.errors.name} aria-describedby="user-name-err"
                {...createForm.register('name')} />
              <FieldError id="user-name-err" message={createForm.formState.errors.name?.message} />
            </div>
            <div>
              <label htmlFor="user-email" className="label">{t('usersPage.email')} *</label>
              <input id="user-email" type="email" className="input" autoComplete="off"
                aria-invalid={!!createForm.formState.errors.email} aria-describedby="user-email-err"
                {...createForm.register('email')} />
              <FieldError id="user-email-err" message={createForm.formState.errors.email?.message} />
            </div>
            <div>
              <label htmlFor="user-password" className="label">{t('usersPage.password')} *</label>
              <input id="user-password" type="password" className="input" autoComplete="new-password"
                aria-invalid={!!createForm.formState.errors.password} aria-describedby="user-password-hint user-password-err"
                {...createForm.register('password')} />
              <p id="user-password-hint" className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('usersPage.password_hint')}</p>
              <FieldError id="user-password-err" message={createForm.formState.errors.password?.message} />
            </div>
            <div>
              <label htmlFor="user-role" className="label">{t('usersPage.role')} *</label>
              <select id="user-role" className="input" {...createForm.register('role')}>
                {ROLES.map((r) => <option key={r} value={r}>{t(`usersPage.role_${r}`)}</option>)}
              </select>
            </div>
          </AdminFormPage>
        )}

        {modal?.kind === 'edit' && (
          <AdminFormPage
            title={t('usersPage.edit_title')}
            icon={UserCog}
            size="md"
            onClose={closeModal}
            onSubmit={editForm.handleSubmit((v) => {
                // O'z qatorida rol o'zgartirilmaydi (serverda ham SELF_ACTION)
                const isSelf = modal.item.id === me?.id;
                updateMutation.mutate({ id: modal.item.id, values: isSelf ? { name: v.name } : v });
              })}
            footer={
              <>
                <button type="button" onClick={closeModal} className="btn-secondary sm:mr-auto">{t('admin.cancel')}</button>
                <button type="submit" disabled={updateMutation.isPending} className="btn-primary">{t('admin.save')}</button>
              </>
            }
          >
            <div>
              <label htmlFor="edit-name" className="label">{t('usersPage.name')} *</label>
              <input id="edit-name" className="input"
                aria-invalid={!!editForm.formState.errors.name} aria-describedby="edit-name-err"
                {...editForm.register('name')} />
              <FieldError id="edit-name-err" message={editForm.formState.errors.name?.message} />
            </div>
            <div>
              <label htmlFor="edit-role" className="label">{t('usersPage.role')} *</label>
              <select id="edit-role" className="input" disabled={modal.item.id === me?.id} {...editForm.register('role')}>
                {ROLES.map((r) => <option key={r} value={r}>{t(`usersPage.role_${r}`)}</option>)}
              </select>
            </div>
          </AdminFormPage>
        )}

        {modal?.kind === 'reset' && (
          <AdminFormModal
            title={`${t('usersPage.reset_title')} — ${modal.item.name}`}
            icon={UserCog}
            size="sm"
            onClose={closeModal}
            onSubmit={resetForm.handleSubmit((v) => resetMutation.mutate({ id: modal.item.id, password: v.password }))}
            footer={
              <>
                <button type="button" onClick={closeModal} className="btn-secondary sm:mr-auto">{t('admin.cancel')}</button>
                <button type="submit" disabled={resetMutation.isPending} className="btn-primary">{t('admin.save')}</button>
              </>
            }
          >
            <div>
              <label htmlFor="reset-password" className="label">{t('usersPage.new_password')} *</label>
              <input id="reset-password" type="password" className="input" autoComplete="new-password"
                aria-invalid={!!resetForm.formState.errors.password} aria-describedby="reset-password-hint reset-password-err"
                {...resetForm.register('password')} />
              <p id="reset-password-hint" className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('usersPage.password_hint')}</p>
              <FieldError id="reset-password-err" message={resetForm.formState.errors.password?.message} />
            </div>
          </AdminFormModal>
        )}

        {modal?.kind === 'delete' && (
          <AdminFormModal
            title={t('usersPage.delete_title')}
            icon={UserCog}
            size="sm"
            onClose={closeModal}
            footer={
              <>
                <button type="button" onClick={closeModal} className="btn-secondary sm:mr-auto">{t('admin.cancel')}</button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(modal.item.id)}
                  className="btn-primary !bg-red-700 hover:!bg-red-800"
                >
                  {t('usersPage.delete')}
                </button>
              </>
            }
          >
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {t('usersPage.delete_text', { name: modal.item.name, email: modal.item.email })}
            </p>
          </AdminFormModal>
        )}
      </div>
    </>
  );
}
