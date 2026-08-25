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

const schema = z.object({
  email: z.string().email('Email noto\'g\'ri'),
  password: z.string().min(8, 'Parol kamida 8 ta belgi'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
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
      setError('Email yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login | Energetika instituti</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-950 to-primary-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="bg-primary-600 text-white p-3 rounded-2xl w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-primary-300 text-sm">Energetika muammolari instituti</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label className="label">{t('admin.email')}</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="input"
                  placeholder="admin@energetika.uz"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">{t('admin.password')}</label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
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
