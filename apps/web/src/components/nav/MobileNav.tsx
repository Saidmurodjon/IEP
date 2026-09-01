import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Lang } from '@energetika/shared';
import { ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
import { LocalizedNavLink } from '@/components/LocalizedLink';
import { telHref } from '@/hooks/useSettings';
import { CONTACT_INFO } from '@/config/contact';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { NAV_ITEMS, isNavGroup, type NavGroup } from '@/config/navigation';
import { isGroupActive, isLinkActive } from './navActive';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  currentLang: Lang;
  onChangeLang: (code: Lang) => void;
}

/** Akkordeon ichidagi bitta guruh — tugma + ochiladigan ro'yxat. */
function AccordionGroup({
  group,
  open,
  panelOpen,
  onToggle,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  open: boolean;
  panelOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const visible = group.children.filter((item) => !item.hidden);
  const buttonId = `mobile-group-${group.id}`;
  const panelId = `mobile-group-panel-${group.id}`;

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        tabIndex={panelOpen ? 0 : -1}
        className="w-full min-h-[44px] flex items-center justify-between py-3 text-left text-[15px] font-medium text-gray-800"
      >
        {t(group.i18nKey)}
        <ChevronDown
          aria-hidden="true"
          className={clsx('h-4 w-4 text-gray-400 transition-transform duration-150 motion-reduce:transition-none', open && 'rotate-180')}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-2 pl-2"
      >
        {visible.map((item) => (
          <LocalizedNavLink
            key={item.id}
            to={item.path}
            tabIndex={panelOpen && open ? 0 : -1}
            onClick={onNavigate}
            aria-current={isLinkActive(pathname, item) ? 'page' : undefined}
            className={({ isActive }) =>
              clsx(
                'min-h-[44px] flex items-center text-sm rounded-md px-2',
                isActive ? 'text-primary-700 font-medium bg-primary-50' : 'text-gray-600'
              )
            }
          >
            {t(item.i18nKey)}
          </LocalizedNavLink>
        ))}
      </div>
    </div>
  );
}

/**
 * To'liq ekranli mobil menyu. Guruhlar akkordeon (bir vaqtda bittasi ochiq),
 * joriy sahifa qaysi guruhga tegishli bo'lsa panel ochilganda o'sha guruh
 * yoyilgan holda chiqadi. Fokus tuzog'i faqat shu yerda (desktop panelda
 * kerak emas — texnik cheklov). Doim DOM da turadi (yopiq holatda
 * `pointer-events-none` + `tabIndex=-1`), faqat shaffoflik/siljish bilan
 * yashiriladi — shuning uchun ochilish animatsiyasi ishlaydi.
 */
export default function MobileNav({ open, onClose, currentLang, onChangeLang }: MobileNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  useFocusTrap(panelRef, open, onClose);

  // Ochilganda joriy sahifaga tegishli guruh yoyilgan holda chiqadi.
  useEffect(() => {
    if (!open) return;
    const activeGroup = NAV_ITEMS.find((item) => isNavGroup(item) && isGroupActive(location.pathname, item));
    setOpenGroupId(activeGroup?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Menyu ochiq turganda orqadagi sahifa scroll qilinmaydi.
  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const phone = CONTACT_INFO.phone;
  const email = CONTACT_INFO.email;

  return (
    <div
      ref={panelRef}
      id="mobile-nav"
      aria-hidden={!open}
      tabIndex={-1}
      className={clsx(
        'fixed inset-0 z-[60] bg-white flex flex-col xl:hidden transition-[opacity,transform] duration-200 motion-reduce:transition-none',
        open ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 flex-shrink-0">
        <span className="text-sm font-bold text-primary-900">{t('common.institute_name_line1')}</span>
        <button
          type="button"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          aria-label={t('a11y.close_menu')}
          className="p-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label={t('a11y.main_nav')} className="flex-1 overflow-y-auto px-4">
        {NAV_ITEMS.map((item) => {
          if (isNavGroup(item)) {
            return (
              <AccordionGroup
                key={item.id}
                group={item}
                open={openGroupId === item.id}
                panelOpen={open}
                onToggle={() => setOpenGroupId((prev) => (prev === item.id ? null : item.id))}
                pathname={location.pathname}
                onNavigate={onClose}
              />
            );
          }
          if (item.hidden) return null;
          return (
            <LocalizedNavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              tabIndex={open ? 0 : -1}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'min-h-[44px] flex items-center border-b border-gray-100 text-[15px] font-medium',
                  isActive ? 'text-primary-700' : 'text-gray-800'
                )
              }
            >
              {t(item.i18nKey)}
            </LocalizedNavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4 flex-shrink-0 space-y-3">
        <div className="flex gap-2" role="group" aria-label={t('common.language')}>
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              lang={lang.code}
              tabIndex={open ? 0 : -1}
              aria-pressed={currentLang === lang.code}
              onClick={() => onChangeLang(lang.code)}
              className={clsx(
                'flex-1 min-h-[44px] text-sm rounded-md border transition-colors',
                currentLang === lang.code
                  ? 'bg-primary-50 text-primary-700 border-primary-200 font-medium'
                  : 'text-gray-600 border-gray-200'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col text-sm text-gray-600">
          {phone && (
            <a href={telHref(phone)} tabIndex={open ? 0 : -1} className="min-h-[44px] flex items-center">
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} tabIndex={open ? 0 : -1} className="min-h-[44px] flex items-center">
              {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
