import { Link } from 'react-router-dom';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Zap } from 'lucide-react';
import { useSettings, telHref } from '@/hooks/useSettings';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  // Aloqa ma'lumotlari `/api/settings` dan keladi — qattiq yozilgan qiymat yo'q.
  const { value, localized } = useSettings();
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
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Zap className="h-5 w-5" />
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
                { to: '/structure', label: t('nav.structure') },
                { to: '/news', label: t('nav.news') },
                { to: '/publications', label: t('nav.publications') },
                { to: '/contact', label: t('nav.contact') },
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

      <div className="border-t border-primary-800">
        <div className="container py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © {year} {t('common.institute_name')}. {t('footer.rights')}.
          </p>
          {/* Admin — ATAYLAB til prefiksisiz: admin marshrutlari o'zgarmaydi. */}
          <Link
            to="/admin"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
