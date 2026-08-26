import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

/**
 * Ochiq sahifalardagi barcha ichki havolalar SHU komponent orqali yoziladi.
 * `to` prefikssiz beriladi (`/news`), komponent joriy tilni qo'shadi (`/uz/news`).
 * Oddiy `Link` ishlatilsa til yo'qoladi — shuning uchun ochiq qismda `Link`
 * to'g'ridan-to'g'ri ishlatilmaydi (CLAUDE.md 4.3, 15-qoida).
 *
 * `/admin` bilan boshlanadigan manzillar o'zgarishsiz qoladi.
 */
export default function LocalizedLink({ to, ...rest }: LinkProps) {
  const localize = useLocalizedPath();
  return <Link to={typeof to === 'string' ? localize(to) : to} {...rest} />;
}

/** `NavLink` ning til prefiksli varianti — `isActive` bilan ishlaydi. */
export function LocalizedNavLink({ to, ...rest }: NavLinkProps) {
  const localize = useLocalizedPath();
  return <NavLink to={typeof to === 'string' ? localize(to) : to} {...rest} />;
}
