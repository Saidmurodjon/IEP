import { useTranslation } from 'react-i18next';
import { FileQuestion } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import LocalizedLink from '@/components/LocalizedLink';

/**
 * Oddiy 404. Brend ko'rinishi 11-topshiriqda to'ldiriladi —
 * hozircha noto'g'ri til prefiksi va noma'lum manzil uchun kerak.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <SeoHead title={t('notfound.title')} />
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-primary-50 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-primary-400" />
          </div>
          <div className="text-5xl font-bold text-primary-900 mb-3">404</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('notfound.title')}</h1>
          <p className="text-gray-500 mb-8">{t('notfound.text')}</p>
          <LocalizedLink to="/" className="btn-primary px-6 py-2.5">
            {t('notfound.home')}
          </LocalizedLink>
        </div>
      </div>
    </>
  );
}
