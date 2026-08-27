import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { logsApi } from '@/lib/api';
import { newsApi, pubsApi, contactApi } from '@/lib/api';
import { Newspaper, BookOpen, MessageSquare, TrendingUp, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/date';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { admin } = useAuthStore();

  const { data: newsData } = useQuery({ queryKey: ['admin-news'], queryFn: () => newsApi.list(1, 5) });
  const { data: pubsData } = useQuery({ queryKey: ['admin-pubs'], queryFn: () => pubsApi.list(1, 1) });
  const { data: msgsData } = useQuery({ queryKey: ['admin-msgs'], queryFn: () => contactApi.list(1) });
  // So'nggi 24 soatdagi hal qilinmagan xatolar — API ro'yxat bilan birga qaytaradi.
  const { data: logsData } = useQuery({
    queryKey: ['admin-logs-badge'],
    queryFn: () => logsApi.list({ limit: 1, resolved: 'false' }),
  });

  const totalNews = newsData?.data?.total ?? 0;
  const totalPubs = pubsData?.data?.total ?? 0;
  const totalMsgs = msgsData?.data?.total ?? 0;
  const recentNews = newsData?.data?.data ?? [];
  // Javobsiz murojaatlar — API ro'yxat bilan birga qaytaradi.
  const unansweredMsgs: number = msgsData?.data?.unanswered ?? 0;
  const unresolvedErrors: number = logsData?.data?.unresolvedLastDay ?? 0;

  const stats = [
    { label: t('admin.total_news'), value: totalNews, icon: Newspaper, to: '/admin/news', color: 'text-blue-600 bg-blue-50' },
    { label: t('admin.total_pubs'), value: totalPubs, icon: BookOpen, to: '/admin/publications', color: 'text-emerald-600 bg-emerald-50' },
    { label: t('admin.total_msgs'), value: totalMsgs, icon: MessageSquare, to: '/admin/messages', color: 'text-orange-600 bg-orange-50' },
    {
      label: t('admin.unanswered_msgs'),
      value: unansweredMsgs,
      icon: TrendingUp,
      to: '/admin/messages',
      color: unansweredMsgs > 0 ? 'text-purple-600 bg-purple-50' : 'text-gray-400 bg-gray-50',
      highlight: unansweredMsgs > 0,
    },
    {
      label: t('admin.unresolved_errors'),
      value: unresolvedErrors,
      icon: Bug,
      to: '/admin/logs',
      // Nol bo'lmasa ko'zga tashlanadigan rangda.
      color: unresolvedErrors > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-50',
      highlight: unresolvedErrors > 0,
    },
  ];

  return (
    <>
      <Helmet><title>Dashboard | Admin</title></Helmet>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
          <p className="text-gray-500 text-sm mt-1">Xush kelibsiz, {admin?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, to, color, highlight }) => (
            <Link
              key={to + label}
              to={to}
              className={`card p-5 hover:shadow-md transition-shadow ${highlight ? 'ring-2 ring-red-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </Link>
          ))}
        </div>

        {/* Recent news */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">So'nggi yangiliklar</h2>
            <Link to="/admin/news" className="text-sm text-primary-700 hover:text-primary-900">
              Barchasini ko'rish →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNews.map((item: Record<string, string>) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <Newspaper className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.titleUz}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(item.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
            {recentNews.length === 0 && (
              <div className="px-5 py-6 text-center text-gray-400 text-sm">
                Yangiliklar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
