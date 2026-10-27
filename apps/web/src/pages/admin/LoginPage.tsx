import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';
import {
  AlertCircle, ArrowLeft, Eye, EyeOff, Globe, LogIn, Monitor, Moon, ShieldCheck, Sun,
} from 'lucide-react';
import clsx from 'clsx';
import FieldError from '@/components/FieldError';
import A11yImage from '@/components/A11yImage';
import HeaderMenu from '@/components/admin/HeaderMenu';
import {
  useAdminPrefs, useApplyAdminPrefs, useResolvedAdminTheme, type AdminLang, type AdminTheme,
} from '@/store/adminPrefs';

const LANGS: AdminLang[] = ['uz', 'en', 'ru'];
const THEMES: { value: AdminTheme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

const schema = z.object({
  email: z.string().email('adminE.login.emailInvalid'),
  password: z.string().min(8, 'adminE.login.passwordShort'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  useApplyAdminPrefs();
  const { lang, setLang, theme, setTheme } = useAdminPrefs();
  const resolvedTheme = useResolvedAdminTheme();
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <>
      <Helmet><title>{t('adminE.login.pageTitle')}</title></Helmet>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950">
        {/* Navbar — asosiy sayt sarlavhasiga o'xshash */}
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <A11yImage
                src="/images/logo-emblem.png"
                alt=""
                aria-hidden="true"
                width={40}
                height={40}
                className="h-9 w-9 flex-shrink-0 object-contain sm:h-10 sm:w-10"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-bold leading-tight text-primary-900 dark:text-white">
                  {t('adminE.login.subtitle')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('common.academy')}</div>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <HeaderMenu
                label={t('adminShell.theme')}
                trigger={<ThemeIcon className="h-5 w-5" aria-hidden="true" />}
                value={theme}
                onSelect={setTheme}
                options={THEMES.map(({ value, icon }) => ({ value, icon, label: t(`adminShell.theme_${value}`) }))}
              />
              <HeaderMenu
                label={t('adminShell.language')}
                trigger={
                  <>
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden uppercase sm:block">{lang}</span>
                  </>
                }
                value={lang}
                onSelect={setLang}
                options={LANGS.map((code) => ({ value: code, lang: code, label: t(`adminShell.lang_${code}`) }))}
              />
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-2">
            {/* Chap panel — faqat keng ekranda */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-800 to-primary-950 p-10 text-white lg:flex">
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
              <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/5" />
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
                  <A11yImage src="/images/logo-emblem.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                </div>
                <p className="text-2xl font-bold leading-snug">{t('adminE.login.subtitle')}</p>
                <p className="mt-2 text-sm text-primary-100">{t('common.academy')}</p>
              </div>
              <p className="relative flex items-center gap-2 text-sm text-primary-100">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {t('adminE.login.secureNote')}
              </p>
            </div>

            {/* Forma */}
            <div className="p-6 sm:p-10">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                {t('adminE.login.heading')}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminE.login.welcome')}</h1>
              <p className="mt-1 mb-6 text-sm text-gray-600 dark:text-gray-400">{t('adminE.login.welcomeHint')}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div aria-live="polite">
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      {error}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="login-email" className="label">{t('admin.email')}</label>
                  <input
                    id="login-email"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="input py-2.5"
                    placeholder="admin@energetika.uz"
                  />
                  <FieldError id="login-email-error" message={errors.email?.message ? t(errors.email.message) : undefined} />
                </div>
                <div>
                  <label htmlFor="login-password" className="label">{t('admin.password')}</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={errors.password ? 'login-password-error' : undefined}
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input py-2.5 pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={t(showPassword ? 'adminE.login.hidePassword' : 'adminE.login.showPassword')}
                      aria-controls="login-password"
                      title={t(showPassword ? 'adminE.login.hidePassword' : 'adminE.login.showPassword')}
                      className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-gray-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:text-white"
                    >
                      {showPassword
                        ? <EyeOff className="h-5 w-5" aria-hidden="true" />
                        : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                  <FieldError id="login-password-error" message={errors.password?.message ? t(errors.password.message) : undefined} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2 w-full py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t('common.loading')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      {t('admin.sign_in')}
                    </span>
                  )}
                </button>
              </form>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-1.5 rounded text-sm text-gray-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('adminE.login.backToSite')}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
