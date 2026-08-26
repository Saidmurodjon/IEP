import { format } from 'date-fns';
import { uz, enUS, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { Lang } from '@energetika/shared';
import i18n from '@/i18n';
import { DEFAULT_LANG, isSupportedLang } from '@/lib/routes';

/**
 * `date-fns` ning o'zbek (lotin) sozlamasi mavjud — `uz`. Kirill varianti
 * (`uz-Cyrl`) ATAYLAB ishlatilmaydi.
 */
const LOCALES: Record<Lang, Locale> = { uz, en: enUS, ru };

/** O'zbekistonda qabul qilingan shakl: `26.08.2026`. */
export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATE_TIME_FORMAT = 'dd.MM.yyyy HH:mm';

function activeLang(): Lang {
  const current = i18n.resolvedLanguage ?? i18n.language;
  return isSupportedLang(current) ? current : DEFAULT_LANG;
}

function safeFormat(value: string | number | Date, pattern: string, lang?: Lang): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, pattern, { locale: LOCALES[lang ?? activeLang()] });
}

/** Sana: `26.08.2026`. Raqamli shakl bo'lgani uchun uchala tilda bir xil. */
export function formatDate(value: string | number | Date, lang?: Lang): string {
  return safeFormat(value, DATE_FORMAT, lang);
}

/** Sana va vaqt: `26.08.2026 14:30`. */
export function formatDateTime(value: string | number | Date, lang?: Lang): string {
  return safeFormat(value, DATE_TIME_FORMAT, lang);
}
