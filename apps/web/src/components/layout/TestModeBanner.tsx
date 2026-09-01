import { useTranslation } from 'react-i18next';

/**
 * Sayt test rejimida ekanini eslatuvchi tasma — sahifaning eng tepasida,
 * uzluksiz aylanadigan matn bilan. Hamkorlar lentasi bilan bir xil CSS
 * texnikasi (`index.css`, `.test-banner-track`) — matn ikki marta chizilib,
 * yarmiga siljitilganda boshlang'ich holatga qaytadi, harakat uzluksiz
 * ko'rinadi. `prefers-reduced-motion` da harakat to'xtaydi.
 */
export default function TestModeBanner() {
  const { t } = useTranslation();
  const message = t('common.test_mode_banner');

  const renderCopy = (clone: boolean) => (
    <div data-clone={clone ? 'true' : undefined} className="flex items-center">
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} className="px-14 whitespace-nowrap text-xs font-medium tracking-wide">
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-accent-600 text-white overflow-hidden" role="status">
      {/* Ekran o'qigich uchun bitta marta — butun tasma `aria-hidden`. */}
      <span className="sr-only">{message}</span>
      <div className="test-banner-track" aria-hidden="true">
        {renderCopy(false)}
        {renderCopy(true)}
      </div>
    </div>
  );
}
