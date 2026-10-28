import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Newspaper, BookOpen, Building2,
  MessageSquare, Zap,
  Users, Handshake, FileText, Bug, Network, UserCog, FlaskConical, Info,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAuthStore, isSuperAdmin } from '@/store/auth';
import { authApi } from '@/lib/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { useApplyAdminPrefs } from '@/store/adminPrefs';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  key: string;
  /** Faqat SUPER_ADMIN ko'radi. */
  superOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/admin/news', icon: Newspaper, key: 'news' },
  { to: '/admin/publications', icon: BookOpen, key: 'publications' },
  { to: '/admin/about', icon: Info, key: 'about' },
  { to: '/admin/structure', icon: Building2, key: 'structure' },
  { to: '/admin/sections', icon: Network, key: 'sections' },
  { to: '/admin/labs', icon: FlaskConical, key: 'labs' },
  { to: '/admin/employees', icon: Users, key: 'employees' },
  { to: '/admin/partners', icon: Handshake, key: 'partners' },
  { to: '/admin/documents', icon: FileText, key: 'documents' },
  { to: '/admin/messages', icon: MessageSquare, key: 'messages' },
  { to: '/admin/logs', icon: Bug, key: 'logs', superOnly: true },
  { to: '/admin/users', icon: UserCog, key: 'users', superOnly: true },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { admin, logout, updateAdmin } = useAuthStore();
  useApplyAdminPrefs();
  const superAdmin = isSuperAdmin(admin);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rol token muddati davomida o'zgargan bo'lishi mumkin — kirganda yangilanadi.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((res) => {
        const me = res.data?.data;
        if (!cancelled && me) updateAdmin({ id: me.id, email: me.email, name: me.name, role: me.role });
      })
      .catch(() => {
        // 401 ni axios interceptor o'zi hal qiladi; boshqa xatoda eski ma'lumot qoladi.
      });
    return () => {
      cancelled = true;
    };
  }, [updateAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-primary-950 text-white w-64 dark:bg-gray-900 dark:border-r dark:border-gray-800">
      <div className="p-4 border-b border-primary-800 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold">Energetika</div>
            <div className="text-xs text-primary-300">{t('adminShell.panel_title')}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.filter((item) => !item.superOnly || superAdmin).map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(`admin.${key}`)}
          </NavLink>
        ))}
      </nav>

    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/*
        Ochiq qismdagi bilan bir xil yondashuv (`PublicLayout`) — klaviatura
        bilan yon menyudan o'tmasdan to'g'ridan-to'g'ri mazmunga o'tish uchun.
      */}
      <a href="#main-content" className="skip-link">
        {t('a11y.skip_to_content')}
      </a>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col h-full w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} onLogout={handleLogout} />

        {/* `tabIndex={-1}` — skip-link havolasi shu elementga fokus beradi */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto focus:outline-none">
          {/* Sahifa yiqilsa yon menyu joyida qoladi */}
          <ErrorBoundary scope="admin">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
