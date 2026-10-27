import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { Lang } from '@energetika/shared';
import { partnersApi } from '@/lib/api';
import { localized } from '@/lib/employee';
import A11yImage from '@/components/A11yImage';

interface Partner {
  id: string;
  nameUz: string; nameEn: string; nameRu: string;
  logoUrl: string;
  websiteUrl?: string | null;
}

/**
 * Hamkor tashkilotlar lentasi. Uzluksiz harakat uchun ro'yxat IKKI MARTA
 * chiziladi va butun lenta yarmiga siljitiladi (CSS: `.partner-track`).
 * Sichqoncha ustiga kelganda to'xtaydi; `prefers-reduced-motion` da
 * animatsiya o'chadi va setka ko'rinadi.
 *
 * Ro'yxat bo'sh bo'lsa butun bo'lim ko'rinmaydi — logotiplar faqat institut
 * taqdim etgan ro'yxat bo'yicha qo'yiladi, o'zimiz tanlamaymiz.
 *
 * Hamkorlar `MARQUEE_MIN` tadan kam bo'lsa lenta aylanmaydi — kartochkalar
 * markazda setka bo'lib turadi (bitta-ikkita kartochkaning takror aylanishi
 * g'alati ko'rinadi).
 */
const MARQUEE_MIN = 5;

export default function PartnersStrip() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersApi.list(),
  });

  const partners: Partner[] = (data?.data?.data ?? []) as Partner[];
  if (partners.length === 0) return null;

  const renderCard = (partner: Partner, clone: boolean) => {
    const name = localized(partner as unknown as Record<string, unknown>, 'name', lang);
    // Nom kartochkada matn bilan yozilgan, shuning uchun logotip bezak (alt="").
    const body = (
      <>
        <span className="flex h-14 sm:h-16 lg:h-20 w-full items-center justify-center">
          <A11yImage
            src={partner.logoUrl}
            alt=""
            loading="lazy"
            className="max-h-full max-w-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </span>
        <span className="mt-3 line-clamp-4 text-center text-xs sm:text-sm font-medium leading-5 text-gray-700 group-hover:text-primary-700">
          {name}
        </span>
      </>
    );
    const cardClass =
      'group flex h-full flex-col items-center rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md';
    return (
      <div
        key={`${partner.id}${clone ? '-clone' : ''}`}
        data-partner-clone={clone ? 'true' : undefined}
        aria-hidden={clone ? 'true' : undefined}
        className="flex-shrink-0 w-44 sm:w-48 lg:w-56 px-2 sm:px-3 py-2"
      >
        {partner.websiteUrl ? (
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={clone ? -1 : undefined}
            className={`${cardClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2`}
          >
            {body}
            <span className="sr-only">{t('common.new_tab')}</span>
          </a>
        ) : (
          <div className={cardClass}>{body}</div>
        )}
      </div>
    );
  };

  return (
    <section className="py-10 sm:py-14 bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('partners.title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('partners.subtitle')}</p>
        </div>
      </div>
      {partners.length < MARQUEE_MIN ? (
        <div className="container">
          <div className="flex flex-wrap justify-center">
            {partners.map((partner) => renderCard(partner, false))}
          </div>
        </div>
      ) : (
        <div className="partner-marquee overflow-hidden">
          <div className="partner-track">
            {partners.map((partner) => renderCard(partner, false))}
            {partners.map((partner) => renderCard(partner, true))}
          </div>
        </div>
      )}
    </section>
  );
}
