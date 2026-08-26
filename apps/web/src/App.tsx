import { Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DEFAULT_LANG, detectPreferredLang, isSupportedLang, matchesPublicRoute } from '@/lib/routes';

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const StructurePage = lazy(() => import('@/pages/public/StructurePage'));
const LabsPage = lazy(() => import('@/pages/public/LabsPage'));
const NewsPage = lazy(() => import('@/pages/public/NewsPage'));
const NewsDetailPage = lazy(() => import('@/pages/public/NewsDetailPage'));
const PublicationsPage = lazy(() => import('@/pages/public/PublicationsPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

// Admin pages
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminNewsPage = lazy(() => import('@/pages/admin/AdminNewsPage'));
const AdminPublicationsPage = lazy(() => import('@/pages/admin/AdminPublicationsPage'));
const AdminStructurePage = lazy(() => import('@/pages/admin/AdminStructurePage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage'));
const AdminNotFoundPage = lazy(() => import('@/pages/admin/AdminNotFoundPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

/**
 * `/:lang` ostidagi hamma narsa shu qorovuldan o'tadi.
 * Til prefiksi noto'g'ri bo'lsa (`/xx/news`) — 404, bosh sahifaga yo'naltirilmaydi.
 * To'g'ri bo'lsa — `i18next` manzildagi tilga moslashtiriladi.
 */
function LanguageGuard() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const valid = isSupportedLang(lang);

  // Render paytida almashtiriladi (resurslar bundle ichida, so'rov ketmaydi),
  // shunda bolalar birinchi render'dayoq to'g'ri tilda chiziladi.
  if (valid && i18n.resolvedLanguage !== lang) {
    void i18n.changeLanguage(lang);
  }

  // Foydalanuvchining oxirgi tanlovi eslab qolinsin — `/` shu asosda yo'naltiriladi.
  useEffect(() => {
    if (!valid) return;
    try {
      localStorage.setItem('i18nextLng', lang);
    } catch {
      // localStorage o'chirilgan bo'lsa, keyingi safar brauzer tiliga tayanamiz.
    }
  }, [valid, lang]);

  // Noto'g'ri prefiks ikki xil bo'lishi mumkin: `/news` (prefiks tushib qolgan) va
  // `/xx/news` (til yo'q). Ikkalasini ham bitta joyda hal qilamiz.
  return valid ? <Outlet /> : <UnprefixedRoute />;
}

/**
 * Prefikssiz manzil. Bizga ma'lum ochiq sahifa bo'lsa — `/uz/...` ga yo'naltiriladi
 * (bitta umumiy qoida, jadval yo'q). Aks holda 404: `/uzbekistan` kabi manzil
 * bosh sahifaga yashirin yo'naltirilmasligi kerak.
 */
function UnprefixedRoute() {
  const { pathname, search, hash } = useLocation();
  if (matchesPublicRoute(pathname)) {
    return <Navigate to={`/${DEFAULT_LANG}${pathname}${search}${hash}`} replace />;
  }
  return <NotFoundPage />;
}

/**
 * `/` har xil foydalanuvchini har xil tilga olib boradi, shuning uchun bu
 * yo'naltirish doimiy emas (302 mantiqi — doimiy 301 qidiruv robotini
 * bitta tilga qulflab qo'yardi). Tarixda iz qoldirmaslik uchun `replace`.
 */
function RootRedirect() {
  return <Navigate to={`/${detectPreferredLang()}`} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* `/` — til aniqlanib, prefiksli manzilga o'tkaziladi */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin — til prefiksisiz, o'zgarmaydi */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="publications" element={<AdminPublicationsPage />} />
          <Route path="structure" element={<AdminStructurePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          {/* Admin ichidagi noma'lum manzil — ochiq saytnikidan alohida sahifa */}
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>

        {/*
          Ochiq sahifalar. Naqshlar `lib/routes.ts` dagi PUBLIC_ROUTES bilan mos
          bo'lishi shart — yangi sahifa avval o'sha ro'yxatga yoziladi.
        */}
        <Route element={<PublicLayout />}>
          <Route path="/:lang" element={<LanguageGuard />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="structure" element={<StructurePage />} />
            <Route path="laboratories" element={<LabsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsDetailPage />} />
            <Route path="publications" element={<PublicationsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Hech qaysi naqshga tushmagan manzillar */}
          <Route path="*" element={<UnprefixedRoute />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
