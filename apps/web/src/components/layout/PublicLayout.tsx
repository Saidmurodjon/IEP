import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/*
        Klaviatura bilan yuruvchi foydalanuvchi butun menyuni bosib o'tmasligi
        uchun. Havola odatda ko'rinmaydi — faqat fokus tushganda chiqadi.
      */}
      <a href="#main-content" className="skip-link">
        {t('a11y.skip_to_content')}
      </a>

      <Header />

      {/* `tabIndex={-1}` — havola bosilganda `main` ning o'ziga fokus beriladi */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/*
          Chegara ATAYLAB shu yerda: sahifa komponenti yiqilsa ham sarlavha va
          footer joyida qoladi, foydalanuvchi boshqa bo'limga o'ta oladi.
        */}
        <ErrorBoundary scope="public">
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
