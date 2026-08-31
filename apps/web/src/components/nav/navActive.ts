import { splitLangPrefix } from '@/lib/routes';
import { isNavGroup, type NavGroup, type NavItem, type NavLink } from '@/config/navigation';

/** Til prefiksini olib tashlaydi va oxiridagi `/` ni tekislaydi. */
function normalize(pathname: string): string {
  const { rest } = splitLangPrefix(pathname);
  return rest === '/' ? '/' : rest.replace(/\/+$/, '');
}

/**
 * Havola faolmi. Bosh sahifa faqat to'liq moslikda, qolganlari prefiks
 * bo'yicha ham — `/news/qandaydir-yangilik` da `Yangiliklar` faol.
 */
export function isLinkActive(pathname: string, link: NavLink): boolean {
  const current = normalize(pathname);
  if (link.path === '/') return current === '/';
  const target = link.path.replace(/\/+$/, '');
  return current === target || current.startsWith(`${target}/`);
}

/** Guruh ichida biror havola faol bo'lsa, guruh ham faol ko'rinadi. */
export function isGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((child) => isLinkActive(pathname, child));
}

export function isItemActive(pathname: string, item: NavItem): boolean {
  return isNavGroup(item) ? isGroupActive(pathname, item) : isLinkActive(pathname, item);
}
