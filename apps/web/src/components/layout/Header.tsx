import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Lang } from '@energetika/shared';
import { Menu, X, Globe, Glasses } from 'lucide-react';
import clsx from 'clsx';
import { telHref } from '@/hooks/useSettings';
import { CONTACT_INFO } from '@/config/contact';
import LocalizedLink from '@/components/LocalizedLink';
import SearchBox from '@/components/SearchBox';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import { useAccessibility } from '@/hooks/useAccessibility';
import { splitLangPrefix } from '@/lib/routes';
import { useCurrentLang } from '@/hooks/useLocalizedPath';
import A11yImage from '@/components/A11yImage';
import DesktopNav from '@/components/nav/DesktopNav';
import MobileNav from '@/components/nav/MobileNav';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export default function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [a11yOpen, setA11yOpen] = useState(false);
  const { changed: a11yChanged } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  // Ko'rsatiladigan til manzildan olinadi — `i18n.language` bilan farq qilmasin.
  const currentLang = useCurrentLang();
  // Aloqa ma'lumotlari statik — `config/contact.ts` (bazadan olinmaydi).
  const { phone, email } = CONTACT_INFO;

  // `Escape` ochiq menyuni, til ro'yxatini va mega-menyu panelini yopadi.
  // Guruh panelining o'zi ham `Escape` ni ushlaydi (fokusni tugmaga
  // qaytarish uchun) — bu yerdagi handler qolgan holatlar uchun zaxira.
  useEffect(() => {
    if (!menuOpen && !langOpen && !activeGroupId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setLangOpen(false);
      setActiveGroupId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, langOpen, activeGroupId]);

  // Marshrut o'zgarganda mobil menyu ham majburan yopiladi.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Til dropdowni ochilsa mega-menyu yopiladi va aksincha — bir vaqtda
  // faqat bitta panel ochiq bo'lishi kerak.
  const toggleLangOpen = useCallback(() => {
    setLangOpen((prev) => !prev);
    setActiveGroupId(null);
  }, []);

  const handleActiveGroupChange = useCallback((id: string | null) => {
    setActiveGroupId(id);
    if (id !== null) setLangOpen(false);
  }, []);

  // Til almashtirilganda foydalanuvchi JORIY sahifada qoladi — faqat prefiks
  // o'zgaradi. `i18next` ni bevosita o'zgartirmaymiz: manzil asosiy manba,
  // `LanguageGuard` uni marshrutdan o'qib sinxronlaydi.
  const changeLang = (code: Lang) => {
    const { rest } = splitLangPrefix(location.pathname);
    const suffix = rest === '/' ? '' : rest;
    navigate(`/${code}${suffix}${location.search}${location.hash}`);
    setLangOpen(false);
  };

  // `useCallback` — a11y sozlamasi o'zgarganda `useAccessibility()` Header'ni
  // qayta render qiladi. Yangi `onClose` bo'lsa `useFocusTrap`ning effekti
  // (dependency sifatida oladi) har safar qayta ishga tushib, panelning
  // BIRINCHI elementiga fokusni qaytarib yuborardi — foydalanuvchi bosgan
  // tugmadan fokus sakrab ketardi.
  const closeA11yPanel = useCallback(() => setA11yOpen(false), []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* Top bar — yengil variant (to'q blok emas). 768px dan tor ekranda butunlay yashirin. */}
      <div className="hidden md:block bg-primary-50 text-primary-800 text-xs py-1.5 border-b border-primary-100">
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
        {/* `relative` — mega-menyu paneli (`DesktopNav`) shu qatorga nisbatan ochiladi */}
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <LocalizedLink to="/" className="flex items-center gap-2 flex-shrink-0">
            {/*
              Sarlavhada FAQAT emblema — yozuvli variant emas. Institut nomi
              yonida matn sifatida turadi va tilga qarab o'zgaradi, yozuvli
              logotip qo'yilsa ingliz/rus tilida o'zbekcha yozuv takrorlanardi.
              Fon neytral (oq) — logotip ranglari bilan urishmasin.
            */}
            <A11yImage
              src="/images/logo-emblem.png"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain flex-shrink-0"
            />
            {/* 768px dan tor ekranda faqat emblema qoladi. */}
            <div className="hidden md:block">
              <div className="text-sm font-bold text-primary-900 leading-tight">
                {t('common.institute_name_line1')}
              </div>
              <div className="text-xs text-gray-500">{t('common.institute_name_line2')}</div>
            </div>
          </LocalizedLink>

          {/* Desktop nav — ikki darajali mega-menyu, `config/navigation.ts` dan */}
          <DesktopNav activeGroupId={activeGroupId} onActiveGroupChange={handleActiveGroupChange} />

          {/* Qidiruv + til + mobil menyu */}
          <div className="flex items-center gap-2">
            <SearchBox />

            {/* Maxsus imkoniyatlar */}
            <button
              type="button"
              onClick={() => setA11yOpen(true)}
              aria-label={t('a11y.open')}
              aria-haspopup="dialog"
              className="relative p-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Glasses className="h-5 w-5" aria-hidden="true" />
              {/* Sozlama o'zgartirilgan bo'lsa — kichik belgi */}
              {a11yChanged && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-700"
                />
              )}
            </button>

            {/* Language */}
            <div className="relative">
              <button
                onClick={toggleLangOpen}
                aria-label={t('common.language')}
                aria-expanded={langOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:block uppercase">{currentLang}</span>
              </button>
              {langOpen && (
                <div role="menu" className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      role="menuitem"
                      lang={lang.code}
                      aria-current={currentLang === lang.code}
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
              aria-label={menuOpen ? t('a11y.close_menu') : t('a11y.open_menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="xl:hidden p-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentLang={currentLang}
        onChangeLang={changeLang}
      />

      {/*
        Tashqariga bosilganda til dropdownini yopadi. FAQAT `langOpen` uchun —
        mega-menyu uchun EMAS: `<header>` `sticky` + `z-40` bo'lgani uchun o'z
        stacking context'ini yaratadi, shu ichida ushbu `fixed z-30` overlay
        `NavGroupButton`ning `z-index: auto` qatlamidan HAMON yuqorida chiziladi
        (stacking context ICHIDA aniq raqamli z-index avtomatikdan doim ustun,
        `position: fixed` bunga ta'sir qilmaydi — u faqat joylashuvga, stacking
        context'ga emas). Natijada guruh ochilgach overlay xuddi shu tugmani
        bosib qolar, kursor "chiqib ketgan" deb hisoblanib yopilar, overlay
        yo'qolgach kursor yana tugmada "kirgan" deb hisoblanib ochilar — davri
        ~300ms bo'lgan cheksiz aylanma (kursor umuman qimirlamasa ham).
        Mega-menyuning tashqariga bosishni ushlashi endi `DesktopNav.tsx` da
        `pointerdown` orqali, overlaysiz amalga oshiriladi.
      */}
      {langOpen && (
        <div aria-hidden="true" className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
      )}

      <AccessibilityPanel open={a11yOpen} onClose={closeA11yPanel} />
    </header>
  );
}
