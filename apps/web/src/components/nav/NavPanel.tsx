import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { LocalizedNavLink } from '@/components/LocalizedLink';
import type { NavGroup } from '@/config/navigation';
import { isLinkActive } from './navActive';

interface NavPanelProps {
  group: NavGroup;
  buttonId: string;
  open: boolean;
  pathname: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Bitta guruhning dropdown paneli — o'z tugmasi tagida, bir ustunli ro'yxat.
 * Har doim DOM da turadi (texnik
 * cheklov 8) — yopiq holatda shaffoflik va tabIndex orqali yashiriladi,
 * `display`/unmount bilan emas, aks holda ochilish animatsiyasi ishlamaydi.
 */
const NavPanel = forwardRef<HTMLDivElement, NavPanelProps>(function NavPanel(
  { group, buttonId, open, pathname, onMouseEnter, onMouseLeave, onKeyDown },
  ref
) {
  const { t } = useTranslation();
  const visible = group.children.filter((item) => !item.hidden);

  return (
    // Hit-test qutisi (bu tashqi `div`) hech qachon siljimaydi — faqat
    // `pointer-events` yopiq/ochiqqa qarab almashadi. Vizual animatsiya
    // (opacity + 4px siljish) ICHKI `div`da. Ular bitta elementda bo'lsa,
    // yopiq holatdagi `-translate-y-1` `pointer-events: auto` bilan bir
    // paytda ishga tushib, panelni bir lahzaga tugmaga yaqinlashtirib
    // qo'yardi — shu payt hover tugma va panel orasida sakrab, ochilib-
    // yopilib ketish sirkilini keltirib chiqarardi.
    <div
      ref={ref}
      id={`nav-panel-${group.id}`}
      role="region"
      aria-labelledby={buttonId}
      aria-hidden={!open}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      // `pt-2` — tugma va panel orasidagi ko'rinmas ko'prik: sichqoncha
      // bo'shliqdan o'tayotganda panel yopilib qolmaydi.
      className={clsx('absolute left-0 top-full z-50 pt-2', open ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      <div
        className={clsx(
          'min-w-[240px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 transition-[opacity,transform] duration-150 motion-reduce:transition-none',
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        )}
      >
        <ul>
          {visible.map((item) => (
            <li key={item.id}>
              <LocalizedNavLink
                to={item.path}
                tabIndex={open ? 0 : -1}
                aria-current={isLinkActive(pathname, item) ? 'page' : undefined}
                className={({ isActive }) =>
                  clsx(
                    'block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
                  )
                }
              >
                {t(item.i18nKey)}
              </LocalizedNavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default NavPanel;
