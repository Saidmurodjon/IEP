import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '@/lib/api';

/** `/api/settings` javobi — kalit → qiymat. */
export type SiteSettings = Record<string, string>;

/**
 * Sayt sozlamalari (manzil, telefon, pochta) bitta so'rov bilan olinadi va
 * react-query keshida saqlanadi, shuning uchun Header, Footer va ContactPage
 * uni ishlatganda ham API'ga faqat bir marta murojaat qilinadi.
 *
 * Qattiq yozilgan zaxira qiymat YO'Q — sozlama bo'sh bo'lsa, chaqiruvchi
 * komponent o'sha qatorni umuman ko'rsatmasligi kerak.
 */
export function useSettings() {
  const { i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.all(),
    staleTime: 5 * 60_000,
  });

  const settings: SiteSettings = data?.data?.data ?? {};

  /** Bitta kalit qiymati; yo'q bo'lsa bo'sh satr. */
  const value = (key: string): string => (settings[key] ?? '').trim();

  /**
   * Til bo'yicha kalit: `address_uz` / `address_en` / `address_ru`.
   * Tanlangan tildagi qiymat bo'sh bo'lsa, o'zbekchasi ishlatiladi —
   * bu tarjima qilinmagan holat uchun, soxta ma'lumot uchun emas.
   */
  const localized = (key: string): string => value(`${key}_${lang}`) || value(`${key}_uz`);

  return { settings, isLoading, value, localized };
}

/** `tel:` havolasi uchun raqamdan bo'shliq va tinish belgilarini olib tashlaydi. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
