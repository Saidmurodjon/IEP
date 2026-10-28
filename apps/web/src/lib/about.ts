import type { AboutContent, AboutStats, Lang, Translation } from '@energetika/shared';

/** `GET /api/about` javobi. */
export interface AboutResponse {
  data: AboutContent;
  stats: AboutStats;
}

/** Tanlangan tildagi matn; tarjima bo'lmasa o'zbekchasi (soxta matn emas). */
export function pick(tr: Translation | undefined, lang: Lang): string {
  if (!tr) return '';
  return (tr[lang] || tr.uz || '').trim();
}

/** Tahrirlagich bo'sh holatda `<p></p>` qoldiradi — uni bo'sh deb hisoblaymiz. */
export function isEmptyHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim() === '' && !/<img\b/i.test(html);
}
