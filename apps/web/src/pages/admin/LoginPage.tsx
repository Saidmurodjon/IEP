import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';
import { Zap, LogIn } from 'lucide-react';
import clsx from 'clsx';
import FieldError from '@/components/FieldError';
import { useAdminPrefs, useApplyAdminPrefs, type AdminLang } from '@/store/adminPrefs';

const LANGS: AdminLang[] = ['uz', 'en', 'ru'];

const schema = z.object({
  email: z.string().email('adminE.login.emailInvalid'),
  password: z.string().min(8, 'adminE.login.passwordShort'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  useApplyAdminPrefs();
  const lang = useAdminPrefs((s) => s.lang);
  const setLang = useAdminPrefs((s) => s.setLang);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Allaqachon kirgan bo'lsa — dashboard'ga yo'naltiramiz.
  // Bu `useEffect` ichida bo'lishi shart: render paytida `navigate()` chaqirish
  // yoki hook'lardan oldin `return` qilish React'ning hook qoidasini buzadi
  // ("Rendered fewer hooks than expected") va admin panel ochilmay qoladi.
  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      setLoading(true);
      setError('');
      const res = await authApi.login(email, password);
      const { token, admin } = res.data.data;
      setAuth(token, admin);
      navigate('/admin/dashboard');
    } catch {
      setError(t('adminE.login.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>{t('adminE.login.pageTitle')}</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-950 to-primary-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-end gap-1 mb-4" role="group" aria-label={t('adminE.login.language')}>
            {LANGS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-white',
                  lang === code
                    ? 'bg-white text-primary-900 border-white'
                    : 'bg-transparent text-primary-100 border-primary-300 hover:bg-primary-800'
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-center mb-8">
            <div className="bg-primary-600 text-white p-3 rounded-2xl w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('adminE.login.heading')}</h1>
            <p className="text-primary-300 text-sm">{t('adminE.login.subtitle')}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="label">{t('admin.email')}</label>
                <input
                  id="login-email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="input"
                  placeholder="admin@energetika.uz"
                />
                <FieldError id="login-email-error" message={errors.email?.message ? t(errors.email.message) : undefined} />
              </div>
              <div>
                <label htmlFor="login-password" className="label">{t('admin.password')}</label>
                <input
                  id="login-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  placeholder="••••••••"
                />
                <FieldError id="login-password-error" message={errors.password?.message ? t(errors.password.message) : undefined} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('admin.sign_in')}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
