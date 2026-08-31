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
 * Bitta guruhning to'liq kengliklik paneli. Har doim DOM da turadi (texnik
 * cheklov 8) — yopiq holatda shaffoflik va tabIndex orqali yashiriladi,
 * `display`/unmount bilan emas, aks holda ochilish animatsiyasi ishlamaydi.
 */
const NavPanel = forwardRef<HTMLDivElement, NavPanelProps>(function NavPanel(
  { group, buttonId, open, pathname, onMouseEnter, onMouseLeave, onKeyDown },
  ref
) {
  const { t } = useTranslation();
  const visible = group.children.filter((item) => !item.hidden);
  const columns = visible.length <= 4 ? 'columns-2' : 'columns-3';

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
      className={clsx('absolute inset-x-0 top-full z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      <div
        className={clsx(
          'border-t-2 border-primary-600 bg-white shadow-2xl rounded-b-xl transition-[opacity,transform] duration-150 motion-reduce:transition-none',
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        )}
      >
        <div className="max-w-[1200px] mx-auto p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            {t(group.i18nKey)}
          </div>
          <div className={clsx(columns, 'gap-8')}>
            {visible.map((item) => (
              <LocalizedNavLink
                key={item.id}
                to={item.path}
                tabIndex={open ? 0 : -1}
                aria-current={isLinkActive(pathname, item) ? 'page' : undefined}
                className={({ isActive }) =>
                  clsx(
                    'block break-inside-avoid mb-2 text-sm py-1 rounded-md transition-colors',
                    isActive ? 'text-primary-700 font-medium' : 'text-gray-700 hover:text-primary-700'
                  )
                }
              >
                {t(item.i18nKey)}
              </LocalizedNavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default NavPanel;
