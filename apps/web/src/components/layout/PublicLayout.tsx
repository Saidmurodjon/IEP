import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
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
