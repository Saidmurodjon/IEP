import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { Lang } from '@energetika/shared';
import { partnersApi } from '@/lib/api';
import { localized } from '@/lib/employee';

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
 */
export default function PartnersStrip() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as Lang;

  const { data } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersApi.list(),
  });

  const partners: Partner[] = (data?.data?.data ?? []) as Partner[];
  if (partners.length === 0) return null;

  const renderLogo = (partner: Partner, clone: boolean) => {
    const name = localized(partner as unknown as Record<string, unknown>, 'name', lang);
    const logo = (
      <img
        src={partner.logoUrl}
        alt={name}
        loading="lazy"
        className="h-12 w-auto max-w-[160px] object-contain opacity-70 hover:opacity-100 transition-opacity"
      />
    );
    return (
      <div
        key={`${partner.id}${clone ? '-clone' : ''}`}
        data-partner-clone={clone ? 'true' : undefined}
        aria-hidden={clone ? 'true' : undefined}
        className="flex items-center justify-center px-8 py-4 flex-shrink-0"
      >
        {partner.websiteUrl ? (
          <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" title={name}>
            {logo}
          </a>
        ) : (
          logo
        )}
      </div>
    );
  };

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">{t('partners.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('partners.subtitle')}</p>
        </div>
      </div>
      <div className="partner-marquee overflow-hidden">
        <div className="partner-track">
          {partners.map((partner) => renderLogo(partner, false))}
          {partners.map((partner) => renderLogo(partner, true))}
        </div>
      </div>
    </section>
  );
}
