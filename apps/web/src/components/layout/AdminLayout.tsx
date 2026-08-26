import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Newspaper, BookOpen, Building2,
  Settings, MessageSquare, LogOut, Zap, Menu, X,
  Users, Handshake, FileText, Bug,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/auth';
import ErrorBoundary from '@/components/ErrorBoundary';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/admin/news', icon: Newspaper, key: 'news' },
  { to: '/admin/publications', icon: BookOpen, key: 'publications' },
  { to: '/admin/structure', icon: Building2, key: 'structure' },
  { to: '/admin/employees', icon: Users, key: 'employees' },
  { to: '/admin/partners', icon: Handshake, key: 'partners' },
  { to: '/admin/documents', icon: FileText, key: 'documents' },
  { to: '/admin/messages', icon: MessageSquare, key: 'messages' },
  { to: '/admin/logs', icon: Bug, key: 'logs' },
  { to: '/admin/settings', icon: Settings, key: 'settings' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-primary-950 text-white w-64">
      <div className="p-4 border-b border-primary-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold">Energetika</div>
            <div className="text-xs text-primary-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, key }) => (
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

      <div className="p-3 border-t border-primary-800">
        <div className="px-3 py-2 mb-2">
          <div className="text-xs text-primary-400">Kirgan:</div>
          <div className="text-sm text-white truncate">{admin?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t('admin.logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
          <div />
        </div>

        <div className="flex-1 overflow-auto">
          {/* Sahifa yiqilsa yon menyu joyida qoladi */}
          <ErrorBoundary scope="admin">
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
