import DOMPurify from 'dompurify';

/**
 * Brauzer tomonidagi HTML tozalash.
 *
 * Server allaqachon saqlashdan oldin tozalaydi (`apps/api/src/lib/sanitize.ts`),
 * bu ikkinchi qatlam: ochiq sahifada `dangerouslySetInnerHTML` bilan
 * ko'rsatishdan oldin va tahrirlagichga qo'yilayotgan matn uchun
 * (CLAUDE.md 7-qoida).
 *
 * Ro'yxat server tomondagi bilan bir xil bo'lishi kerak.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 's', 'del', 'u',
  'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr',
  'code', 'pre', 'a', 'img', 'figure', 'figcaption',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'start'];

/** Rasm faqat o'z omborimizdan — tashqi manba ham, `data:` ham emas. */
function pruneDisallowedSources(root: Document | DocumentFragment | HTMLElement) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    if (!src.startsWith('/api/files/')) img.remove();
  });
  root.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href')?.trim().toLowerCase() ?? '';
    const safe = href.startsWith('/') || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href);
    if (!safe) anchor.removeAttribute('href');
    if (anchor.getAttribute('target') === '_blank') {
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/** Ochiq sahifada ko'rsatishdan oldin. */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: true,
  });
  pruneDisallowedSources(clean);
  const wrapper = document.createElement('div');
  wrapper.appendChild(clean);
  return wrapper.innerHTML;
}

/**
 * Tahrirlagichga qo'yilayotgan matnni tozalash.
 *
 * Word va veb sahifadan nusxa ko'chirilganda juda ko'p keraksiz belgilash
 * keladi: `mso-` uslublari, `<o:p>` teglari, `class` va `style` atributlari.
 * Ular ruxsat etilgan ro'yxatga kirmagani uchun tushib qoladi; bu yerda
 * qo'shimcha ravishda Word ning bo'sh paragraflari ham olib tashlanadi.
 */
export function sanitizePastedHtml(input: string): string {
  if (!input) return '';
  const withoutWordTags = input
    .replace(/<\/?(?:o|w|m|v):[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const clean = DOMPurify.sanitize(withoutWordTags, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: true,
  });
  pruneDisallowedSources(clean);

  const wrapper = document.createElement('div');
  wrapper.appendChild(clean);
  // Word ko'pincha `&nbsp;` bilan to'ldirilgan bo'sh paragraflar qoldiradi.
  wrapper.querySelectorAll('p').forEach((paragraph) => {
    if (!paragraph.textContent?.replace(/ /g, '').trim() && !paragraph.querySelector('img')) {
      paragraph.remove();
    }
  });
  return wrapper.innerHTML;
}
