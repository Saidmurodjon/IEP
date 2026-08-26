import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useSettings, telHref } from '@/hooks/useSettings';
import LocalizedLink, { LocalizedNavLink } from '@/components/LocalizedLink';
import { splitLangPrefix } from '@/lib/routes';
import { useCurrentLang } from '@/hooks/useLocalizedPath';

const LANGS = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export default function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Ko'rsatiladigan til manzildan olinadi — `i18n.language` bilan farq qilmasin.
  const currentLang = useCurrentLang();
  // Aloqa ma'lumotlari `/api/settings` dan keladi — kodda qattiq yozilmaydi.
  const { value } = useSettings();
  const phone = value('phone');
  const email = value('email');

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/structure', label: t('nav.structure') },
    { to: '/laboratories', label: t('nav.labs') },
    { to: '/news', label: t('nav.news') },
    { to: '/publications', label: t('nav.publications') },
    { to: '/contact', label: t('nav.contact') },
  ];

  // Til almashtirilganda foydalanuvchi JORIY sahifada qoladi — faqat prefiks
  // o'zgaradi. `i18next` ni bevosita o'zgartirmaymiz: manzil asosiy manba,
  // `LanguageGuard` uni marshrutdan o'qib sinxronlaydi.
  const changeLang = (code: string) => {
    const { rest } = splitLangPrefix(location.pathname);
    const suffix = rest === '/' ? '' : rest;
    navigate(`/${code}${suffix}${location.search}${location.hash}`);
    setLangOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* Top bar — yengil variant (to'q blok emas) */}
      <div className="bg-primary-50 text-primary-800 text-xs py-1.5 border-b border-primary-100">
        <div className="container flex justify-between items-center">
          <span>{t('common.academy')}</span>
          <div className="flex items-center gap-4">
            {phone && (
              <a href={telHref(phone)} className="hover:text-primary-600 transition-colors">
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="hover:text-primary-600 transition-colors">
                {email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <LocalizedLink to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-primary-700 text-white p-2 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-primary-900 leading-tight">
                {t('common.institute_name_line1')}
              </div>
              <div className="text-xs text-gray-500">{t('common.institute_name_line2')}</div>
            </div>
          </LocalizedLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <LocalizedNavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                  )
                }
              >
                {link.label}
              </LocalizedNavLink>
            ))}
          </nav>

          {/* Language switcher + mobile menu */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:block uppercase">{currentLang}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLang(lang.code)}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-sm transition-colors',
                        currentLang === lang.code
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <LocalizedNavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                  )
                }
              >
                {link.label}
              </LocalizedNavLink>
            ))}
          </div>
        )}
      </div>

      {/* Close lang dropdown on outside click */}
      {langOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
      )}
    </header>
  );
}
