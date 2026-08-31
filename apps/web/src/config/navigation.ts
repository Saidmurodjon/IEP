/**
 * Sarlavha menyusining yagona manbai — topshiriq 13.
 *
 * Bu yerda faqat ma'lumot: `id`, i18n kaliti, manzil, `hidden` belgisi.
 * JSX, stil yoki shart bu faylga yozilmaydi (CLAUDE.md 4.3, 15-qoida davomi).
 *
 * Sarlavha menyusi, mobil menyu, footerdagi «Sahifalar» ro'yxati va 404
 * sahifasidagi «Asosiy bo'limlar» shu massivdan oziqlanadi. Havola boshqa
 * joyda qo'lda yozilmasin.
 *
 * `id` keyinchalik o'zgartirilmaydi — i18n kaliti va `aria-controls`/
 * `aria-labelledby` shunga tayanadi.
 */

/** Dropdownsiz yakka havola — yuqori darajada yoki guruh ichida. */
export interface NavLink {
  id: string;
  /** `t()` uchun to'liq i18n kaliti. */
  i18nKey: string;
  /** Til prefiksisiz manzil — `LocalizedLink` prefiks qo'shadi. */
  path: string;
  /** Sahifa hali yaratilmagan — konfiguratsiyada joy oladi, menyuda chiqmaydi. */
  hidden?: boolean;
}

/** Ikkinchi darajali panel ochadigan yuqori daraja elementi. */
export interface NavGroup {
  id: string;
  /** Guruh sarlavhasining i18n kaliti. */
  i18nKey: string;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', i18nKey: 'nav.home', path: '/' },
  {
    id: 'institute',
    i18nKey: 'nav.institute.label',
    children: [
      { id: 'institute-about', i18nKey: 'nav.institute.items.about', path: '/about' },
      { id: 'institute-history', i18nKey: 'nav.institute.items.history', path: '/about/history', hidden: true },
      { id: 'institute-management', i18nKey: 'nav.institute.items.management', path: '/management' },
      { id: 'institute-structure', i18nKey: 'nav.institute.items.structure', path: '/structure' },
      { id: 'institute-employees', i18nKey: 'nav.institute.items.employees', path: '/employees' },
      { id: 'institute-documents', i18nKey: 'nav.institute.items.documents', path: '/documents' },
      // Hozircha ochiq sahifa yo'q — faqat admin CRUD va bosh sahifa lentasi bor.
      { id: 'institute-partners', i18nKey: 'nav.institute.items.partners', path: '/partners', hidden: true },
      { id: 'institute-vacancies', i18nKey: 'nav.institute.items.vacancies', path: '/vacancies', hidden: true },
    ],
  },
  {
    id: 'science',
    i18nKey: 'nav.science.label',
    children: [
      { id: 'science-labs', i18nKey: 'nav.science.items.labs', path: '/laboratories' },
      { id: 'science-research', i18nKey: 'nav.science.items.research', path: '/research', hidden: true },
      { id: 'science-projects', i18nKey: 'nav.science.items.projects', path: '/projects', hidden: true },
      { id: 'science-publications', i18nKey: 'nav.science.items.publications', path: '/publications' },
      { id: 'science-patents', i18nKey: 'nav.science.items.patents', path: '/patents', hidden: true },
      { id: 'science-council', i18nKey: 'nav.science.items.council', path: '/council', hidden: true },
      { id: 'science-phd', i18nKey: 'nav.science.items.phd', path: '/phd', hidden: true },
    ],
  },
  {
    id: 'info',
    i18nKey: 'nav.info.label',
    children: [
      { id: 'info-news', i18nKey: 'nav.info.items.news', path: '/news' },
      { id: 'info-announcements', i18nKey: 'nav.info.items.announcements', path: '/announcements', hidden: true },
      { id: 'info-events', i18nKey: 'nav.info.items.events', path: '/events', hidden: true },
      { id: 'info-gallery', i18nKey: 'nav.info.items.gallery', path: '/gallery', hidden: true },
      { id: 'info-video', i18nKey: 'nav.info.items.video', path: '/video', hidden: true },
    ],
  },
  {
    id: 'openness',
    i18nKey: 'nav.openness.label',
    children: [
      { id: 'openness-appeal-status', i18nKey: 'nav.openness.items.appealStatus', path: '/appeal-status' },
      { id: 'openness-open-data', i18nKey: 'nav.openness.items.openData', path: '/open-data', hidden: true },
      { id: 'openness-anticorruption', i18nKey: 'nav.openness.items.anticorruption', path: '/anticorruption', hidden: true },
      { id: 'openness-faq', i18nKey: 'nav.openness.items.faq', path: '/faq', hidden: true },
    ],
  },
  { id: 'contact', i18nKey: 'nav.contact', path: '/contact' },
] as const;

/** Barcha `hidden` bo'lmagan yakka havolalarni ekrandagi tartibda tekislaydi. */
export function flattenVisibleLinks(items: readonly NavItem[] = NAV_ITEMS): NavLink[] {
  const result: NavLink[] = [];
  for (const item of items) {
    if (isNavGroup(item)) {
      result.push(...flattenVisibleLinks(item.children));
    } else if (!item.hidden) {
      result.push(item);
    }
  }
  return result;
}

/** `id` bo'yicha yakka havolani topadi (guruh emas). Topilmasa `undefined`. */
export function findNavLink(id: string, items: readonly NavItem[] = NAV_ITEMS): NavLink | undefined {
  for (const item of items) {
    if (isNavGroup(item)) {
      const found = findNavLink(id, item.children);
      if (found) return found;
    } else if (item.id === id) {
      return item;
    }
  }
  return undefined;
}
