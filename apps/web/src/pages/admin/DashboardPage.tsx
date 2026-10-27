import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { logsApi, newsApi, statsApi } from '@/lib/api';
import BarCard from '@/components/admin/charts/BarCard';
import { Newspaper, BookOpen, MessageSquare, Users, FileText, HardDrive, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore, isSuperAdmin } from '@/store/auth';
import { formatDate } from '@/lib/date';
import type { LucideIcon } from 'lucide-react';
import type { BarDatum } from '@/components/admin/charts/BarCard';

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { admin } = useAuthStore();

  const { data: newsData } = useQuery({ queryKey: ['admin-news'], queryFn: () => newsApi.list(1, 5) });
  const statsQuery = useQuery({ queryKey: ['admin-stats'], queryFn: () => statsApi.get() });
  // So'nggi 24 soatdagi hal qilinmagan xatolar — API ro'yxat bilan birga qaytaradi.
  const { data: logsData } = useQuery({
    queryKey: ['admin-logs-badge'],
    queryFn: () => logsApi.list({ limit: 1, resolved: 'false' }),
    // ADMIN uchun 403 qaytadi — so'rov faqat SUPER_ADMIN'ga yuboriladi.
    enabled: isSuperAdmin(admin),
  });

  const recentNews = newsData?.data?.data ?? [];
  const stats = statsQuery.data?.data?.data;
  const unresolvedErrors: number = logsData?.data?.unresolvedLastDay ?? 0;


  const superAdmin = isSuperAdmin(admin);
  const lang = i18n.language;
  const tt = (k: string, o?: Record<string, unknown>) => t(`admin.dashboardStats.${k}`, o);

  // Oy yorlig'i: qisqa oy nomi (+ yanvar yoki birinchi ustunda 2 xonali yil).
  // Nomlar locales'dan olinadi — brauzerlarda o'zbekcha `Intl` ma'lumoti yo'q («M11» chiqadi).
  const monthNames = t('admin.dashboardStats.monthsShort', { returnObjects: true }) as string[];
  const monthData = (rows: { month: string; count: number }[] = []): BarDatum[] =>
    rows.map(({ month, count }, idx) => {
      const [y, m] = month.split('-').map(Number);
      const name = monthNames[m - 1] ?? month;
      const withYear = m === 1 || idx === 0;
      return { label: withYear ? `${name} ${String(y).slice(-2)}` : name, value: count };
    });

  const unitName = (u: { nameUz: string; nameEn: string; nameRu: string; unitId: string }) => {
    if (u.unitId === 'other') return tt('other');
    const byLang = lang.startsWith('ru') ? u.nameRu : lang.startsWith('en') ? u.nameEn : u.nameUz;
    return byLang || u.nameUz;
  };

  const fmtBytes = (bytes: number) => {
    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
    let v = bytes;
    let u = 0;
    while (v >= 1024 && u < units.length - 1) { v /= 1024; u += 1; }
    return new Intl.NumberFormat(lang, { style: 'unit', unit: units[u], unitDisplay: 'short', maximumFractionDigits: u === 0 ? 0 : 1 }).format(v);
  };
  const num = new Intl.NumberFormat(lang);

  interface Tile {
    label: string; value: string; sub?: string; icon: LucideIcon; to?: string; color: string; highlight?: boolean;
  }
  const appealsOpen = stats?.totals.appealsOpen ?? 0;
  const tiles: Tile[] = stats ? [
    { label: tt('kpiNews'), value: num.format(stats.totals.newsPublished), sub: tt('kpiDrafts', { count: stats.totals.newsDrafts }), icon: Newspaper, to: '/admin/news', color: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30' },
    { label: tt('kpiPubs'), value: num.format(stats.totals.publications), icon: BookOpen, to: '/admin/publications', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' },
    { label: tt('kpiEmployees'), value: num.format(stats.totals.employeesActive), icon: Users, to: '/admin/employees', color: 'text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30' },
    { label: tt('kpiDocs'), value: num.format(stats.totals.documentsActive), icon: FileText, to: '/admin/documents', color: 'text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/30' },
    { label: tt('kpiAppeals'), value: num.format(appealsOpen), icon: MessageSquare, to: '/admin/messages', color: appealsOpen > 0 ? 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-900/30' : 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800', highlight: appealsOpen > 0 },
    { label: tt('kpiStorage'), value: fmtBytes(stats.totals.storageBytes), icon: HardDrive, color: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800' },
  ] : [];

  const chartProps = { loading: statsQuery.isLoading, error: statsQuery.isError, onRetry: () => { void statsQuery.refetch(); } };

  return (
    <>
      <Helmet><title>{t('adminE.dashboard.title')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{tt('welcome', { name: admin?.name })}</p>
        </div>

        {/* KPI kartochkalari */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4" aria-live="polite">
          {statsQuery.isLoading && Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card p-5 h-[108px] animate-pulse bg-gray-100 dark:bg-gray-800" aria-hidden="true" />
          ))}
          {tiles.map(({ label, value, sub, icon: Icon, to, color, highlight }) => {
            const body = (
              <>
                <div className={`p-2 rounded-lg inline-flex mb-3 ${color}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</div>
                {sub && <div className="text-xs text-gray-600 dark:text-gray-300">{sub}</div>}
              </>
            );
            // Havolasiz kartochka (masalan, xotira) — oddiy blok, bosiladigan emas.
            return to ? (
              <Link key={label} to={to} className={`card p-5 hover:shadow-md transition-shadow ${highlight ? 'ring-2 ring-orange-300 dark:ring-orange-700' : ''}`}>{body}</Link>
            ) : (
              <div key={label} className="card p-5">{body}</div>
            );
          })}
        </div>
        {superAdmin && (
          <Link
            to="/admin/logs"
            className={`card p-4 mb-4 flex items-center gap-3 hover:shadow-md transition-shadow ${unresolvedErrors > 0 ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}`}
          >
            <div className={`p-2 rounded-lg ${unresolvedErrors > 0 ? 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30' : 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800'}`}>
              <Bug className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{unresolvedErrors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t('admin.unresolved_errors')}</div>
          </Link>
        )}

        {/* Diagrammalar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <BarCard {...chartProps} title={tt('chartNews')} data={monthData(stats?.newsByMonth)} />
          <BarCard {...chartProps} title={tt('chartAppeals')} data={monthData(stats?.appealsByMonth)} />
          <BarCard {...chartProps} horizontal title={tt('chartStatus')} data={(stats?.appealsByStatus ?? []).map((s) => ({ label: tt(`status.${s.status}`), value: s.count }))} />
          <BarCard {...chartProps} title={tt('chartPubs')} data={(stats?.publicationsByYear ?? []).map((p) => ({ label: String(p.year), value: p.count }))} />
          <BarCard {...chartProps} horizontal title={tt('chartUnits')} data={(stats?.employeesByUnit ?? []).map((u) => ({ label: unitName(u), value: u.count }))} />
        </div>

        {/* Recent news */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{tt('recentNews')}</h2>
            <Link to="/admin/news" className="text-sm text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-200">
              {tt('viewAll')}
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentNews.map((item: Record<string, string>) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <Newspaper className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.titleUz}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(item.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
            {recentNews.length === 0 && (
              <div className="px-5 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                {tt('noNews')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
