import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FileQuestion } from 'lucide-react';

/**
 * Admin panel ichidagi noma'lum manzil. Ochiq saytnikidan alohida:
 * bu yerda qidiruv va ochiq bo'limlarga havolalar kerak emas, faqat
 * boshqaruv sahifasiga qaytish. Admin marshrutlari til prefiksisiz.
 */
export default function AdminNotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('notFound.title')} | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="py-20 text-center">
        <div className="bg-gray-100 rounded-full w-14 h-14 mx-auto mb-5 flex items-center justify-center">
          <FileQuestion className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-2">404</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">{t('notFound.title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('notFound.admin_text')}</p>
        <Link to="/admin/dashboard" className="btn-primary px-6 py-2.5">
          {t('notFound.admin_back')}
        </Link>
      </div>
    </>
  );
}
