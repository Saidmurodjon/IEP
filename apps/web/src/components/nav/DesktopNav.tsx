import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { LocalizedNavLink } from '@/components/LocalizedLink';
import { NAV_ITEMS, isNavGroup } from '@/config/navigation';
import { isItemActive } from './navActive';
import NavGroupButton from './NavGroupButton';
import NavPanel from './NavPanel';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 200;

interface DesktopNavProps {
  activeGroupId: string | null;
  onActiveGroupChange: (id: string | null) => void;
}

/**
 * Desktop mega-menyu. WAI-ARIA Disclosure Navigation naqshi (menubar emas —
 * bu sayt navigatsiyasi). Bitta paytda bitta panel ochiq, guruhdan guruhga
 * o'tishda kechikish yo'q, chetga chiqilganda 200ms, ustiga kelinganda 100ms
 * kechikish bilan ochiladi/yopiladi.
 */
export default function DesktopNav({ activeGroupId, onActiveGroupChange }: DesktopNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  // ArrowDown bilan ochilganda birinchi havolaga fokus o'tishi kerak,
  // sichqoncha bilan ochilganda esa fokus tugmada qolishi kerak.
  const focusFirstLinkRef = useRef(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Marshrut o'zgarganda barcha panellar yopiladi.
  useEffect(() => {
    clearTimers();
    onActiveGroupChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Sahifa scroll qilinganda ochiq panel yopiladi.
  useEffect(() => {
    if (activeGroupId === null) return undefined;
    const onScroll = () => onActiveGroupChange(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeGroupId, onActiveGroupChange]);

  // Fokus ochiq guruhning tugmasi va panelidan tashqariga chiqsa — yopiladi
  // (masalan panelning oxirgi havolasidan `Tab` bosilganda).
  useEffect(() => {
    if (activeGroupId === null) return undefined;
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      const button = buttonRefs.current.get(activeGroupId);
      const panel = panelRefs.current.get(activeGroupId);
      if (next && ((button && button.contains(next)) || (panel && panel.contains(next)))) return;
      onActiveGroupChange(null);
    };
    document.addEventListener('focusout', onFocusOut);
    return () => document.removeEventListener('focusout', onFocusOut);
  }, [activeGroupId, onActiveGroupChange]);

  // Fokus ArrowDown bilan panelga o'tishi kerak bo'lsa, panel ochilgach shu yerda beriladi.
  useEffect(() => {
    if (activeGroupId && focusFirstLinkRef.current) {
      const panel = panelRefs.current.get(activeGroupId);
      panel?.querySelector<HTMLAnchorElement>('a')?.focus();
      focusFirstLinkRef.current = false;
    }
  }, [activeGroupId]);

  const scheduleOpen = useCallback(
    (id: string) => {
      clearTimers();
      if (activeGroupId !== null && activeGroupId !== id) {
        // Bir guruhdan ikkinchisiga — kechikishsiz almashadi.
        onActiveGroupChange(id);
        return;
      }
      openTimer.current = window.setTimeout(() => onActiveGroupChange(id), OPEN_DELAY);
    },
    [activeGroupId, clearTimers, onActiveGroupChange]
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => onActiveGroupChange(null), CLOSE_DELAY);
  }, [clearTimers, onActiveGroupChange]);

  const closeNow = useCallback(() => {
    clearTimers();
    onActiveGroupChange(null);
  }, [clearTimers, onActiveGroupChange]);

  // Tashqariga bosilganda panel yopiladi — TO'LIQ EKRANLI OVERLAY ORQALI EMAS.
  // `<header>` `sticky` + `z-40` bo'lgani uchun o'z stacking context'ini
  // yaratadi; shu ichida `fixed z-30` overlay guruh tugmasining
  // `z-index: auto` qatlamidan baribir YUQORIDA chiziladi (aniq raqamli
  // z-index stacking context ICHIDA avtomatikdan doim ustun bo'ladi,
  // `position: fixed` bunga ta'sir qilmaydi). Natijada overlay ochilgan
  // tugmani bosib qolib, kursor harakatlanmasa ham mouseleave/mouseenter
  // sirkilini keltirib chiqargan edi. Shu sabab bu yerda oddiy hujjat
  // darajasidagi `pointerdown` ishlatiladi, ekranni yopadigan qatlam yo'q.
  useEffect(() => {
    if (activeGroupId === null) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const button = buttonRefs.current.get(activeGroupId);
      const panel = panelRefs.current.get(activeGroupId);
      if ((button && button.contains(target)) || (panel && panel.contains(target))) return;
      closeNow();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [activeGroupId, closeNow]);

  const toggle = useCallback(
    (id: string) => {
      clearTimers();
      onActiveGroupChange(activeGroupId === id ? null : id);
    },
    [activeGroupId, clearTimers, onActiveGroupChange]
  );

  const handleButtonKeyDown = useCallback(
    (id: string) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusFirstLinkRef.current = true;
        clearTimers();
        onActiveGroupChange(id);
        return;
      }
      if (event.key === 'Escape' && activeGroupId === id) {
        closeNow();
      }
    },
    [activeGroupId, clearTimers, closeNow, onActiveGroupChange]
  );

  const handlePanelKeyDown = useCallback(
    (id: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNow();
        buttonRefs.current.get(id)?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const panel = panelRefs.current.get(id);
      if (!panel) return;
      const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a'));
      const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (currentIndex === -1) return;
      event.preventDefault();
      const nextIndex =
        event.key === 'ArrowDown' ? Math.min(currentIndex + 1, links.length - 1) : Math.max(currentIndex - 1, 0);
      links[nextIndex]?.focus();
    },
    [closeNow]
  );

  return (
    <>
      <nav aria-label={t('a11y.main_nav')} className="hidden xl:flex flex-shrink-0 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          if (isNavGroup(item)) {
            return (
              <NavGroupButton
                key={item.id}
                ref={(el) => {
                  if (el) buttonRefs.current.set(item.id, el);
                  else buttonRefs.current.delete(item.id);
                }}
                group={item}
                open={activeGroupId === item.id}
                active={isItemActive(location.pathname, item)}
                onClick={() => toggle(item.id)}
                onKeyDown={handleButtonKeyDown(item.id)}
                onMouseEnter={() => scheduleOpen(item.id)}
                onMouseLeave={scheduleClose}
              />
            );
          }
          if (item.hidden) return null;
          return (
            <LocalizedNavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onMouseEnter={scheduleClose}
              className={({ isActive }) =>
                clsx(
                  'relative flex-shrink-0 px-3.5 py-2.5 text-[15px] font-medium whitespace-nowrap rounded-lg transition-colors',
                  isActive
                    ? "text-primary-700 after:absolute after:left-3.5 after:right-3.5 after:-bottom-px after:h-0.5 after:bg-primary-700 after:content-['']"
                    : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                )
              }
            >
              {t(item.i18nKey)}
            </LocalizedNavLink>
          );
        })}
      </nav>

      {NAV_ITEMS.filter(isNavGroup).map((group) => (
        <NavPanel
          key={group.id}
          ref={(el) => {
            if (el) panelRefs.current.set(group.id, el);
            else panelRefs.current.delete(group.id);
          }}
          group={group}
          buttonId={`nav-button-${group.id}`}
          open={activeGroupId === group.id}
          pathname={location.pathname}
          onMouseEnter={clearTimers}
          onMouseLeave={scheduleClose}
          onKeyDown={handlePanelKeyDown(group.id)}
        />
      ))}
    </>
  );
}
