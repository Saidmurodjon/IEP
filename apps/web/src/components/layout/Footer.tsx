import { Link } from 'react-router-dom';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useSettings, telHref } from '@/hooks/useSettings';
import { formatDate } from '@/lib/date';
import A11yImage from '@/components/A11yImage';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  // Aloqa ma'lumotlari `/api/settings` dan keladi — qattiq yozilgan qiymat yo'q.
  const { value, localized, lastUpdatedAt } = useSettings();
  const address = localized('address');
  const phone = value('phone');
  const email = value('email');
  const workingHours = value('working_hours');

  return (
    <footer className="bg-primary-950 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/*
                Footerda to'liq logotip (emblema + yozuv). Logotip yozuvining
                bir qismi to'q ko'k, footer foni ham to'q — shuning uchun
                logotip oq maydonchada turadi, aks holda yozuv ko'rinmaydi.
              */}
              <div className="bg-white rounded-lg p-2 flex-shrink-0">
                <A11yImage
                  src="/images/logo-full.png"
                  alt={t('common.institute_name')}
                  width={72}
                  height={72}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <div className="text-white font-bold">{t('common.institute_name')}</div>
                <div className="text-xs text-gray-400">{t('common.academy')}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.pages')}
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/management', label: t('nav.management') },
                { to: '/structure', label: t('nav.structure') },
                { to: '/employees', label: t('nav.employees') },
                { to: '/news', label: t('nav.news') },
                { to: '/publications', label: t('nav.publications') },
                { to: '/documents', label: t('nav.documents') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/appeal-status', label: t('nav.appeal_status') },
              ].map((link) => (
                <li key={link.to}>
                  <LocalizedLink
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('contact.title')}
            </h3>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-400" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-400" />
                  <a href={telHref(phone)} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary-400" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </li>
              )}
              {workingHours && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4 flex-shrink-0 text-primary-400" />
                  <span>{workingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/*
        VM ning 2021-yil 15-iyundagi 373-son qarori talablari:
        materiallardan foydalanish sharti va axborotning yangilanish sanasi.
      */}
      <div className="border-t border-primary-800/70">
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* To'q footer fonida `gray-500` 3.1:1 beradi — `gray-400` 5.9:1 (10B4). */}
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            {t('footer.usage_terms')}
          </p>
          {lastUpdatedAt && (
            <p className="text-xs text-gray-400 flex-shrink-0">
              {t('footer.last_updated')}: <time dateTime={lastUpdatedAt}>{formatDate(lastUpdatedAt)}</time>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-primary-800">
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            © {year} {t('common.institute_name')}. {t('footer.rights')}.
          </p>
          {/* Admin — ATAYLAB til prefiksisiz: admin marshrutlari o'zgarmaydi. */}
          <Link
            to="/admin"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
