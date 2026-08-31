import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { NavGroup } from '@/config/navigation';

interface NavGroupButtonProps {
  group: NavGroup;
  open: boolean;
  active: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/** Guruh sarlavhasi — **tugma**, havola emas (WAI-ARIA Disclosure naqshi). */
const NavGroupButton = forwardRef<HTMLButtonElement, NavGroupButtonProps>(function NavGroupButton(
  { group, open, active, onClick, onKeyDown, onMouseEnter, onMouseLeave },
  ref
) {
  const { t } = useTranslation();
  return (
    <button
      ref={ref}
      id={`nav-button-${group.id}`}
      type="button"
      aria-expanded={open}
      aria-controls={`nav-panel-${group.id}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'relative flex items-center gap-1 px-3.5 py-2.5 text-[15px] font-medium rounded-lg transition-colors',
        open
          ? 'bg-primary-50 text-primary-700'
          : active
            ? 'text-primary-700'
            : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50',
        active &&
          "after:absolute after:left-3.5 after:right-3.5 after:-bottom-px after:h-0.5 after:bg-primary-700 after:content-['']"
      )}
    >
      {t(group.i18nKey)}
      <ChevronDown
        aria-hidden="true"
        className={clsx('h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none', open && 'rotate-180')}
      />
    </button>
  );
});

export default NavGroupButton;
