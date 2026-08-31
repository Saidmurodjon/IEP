import type { Lang } from '@energetika/shared';

/**
 * Institut aloqa ma'lumotlari — STATIK.
 *
 * Ilgari `/api/settings` orqali bazadan olinardi. Bu ma'lumot amalda deyarli
 * o'zgarmaydi va admin panelda tahrirlanmasdi, shuning uchun har bir sahifa
 * yuklanganda alohida so'rov yuborishning hojati yo'q edi — shu fayl orqali
 * to'g'ridan-to'g'ri bundle'ga qo'shiladi.
 *
 * Manzil o'zgarsa (yangi bino, telefon, pochta) — shu faylni tahrirlang va
 * qayta deploy qiling. `SiteSetting` jadvalidagi `email` qatori BU YERGA
 * bog'liq EMAS: u alohida, murojaat bildirishnomalari uchun ishlatiladi
 * (`apps/api/src/routes/contact.ts`, `appeals_email` bo'sh bo'lganda zaxira).
 */
export const CONTACT_INFO = {
  address: {
    uz: "Toshkent shahri, Mirzo Ulug'bek tumani, Do'rmon yo'li ko'chasi, 40-uy",
    en: '40 Dormon Yoli Street, Mirzo Ulugbek district, Tashkent',
    ru: 'г. Ташкент, Мирзо-Улугбекский район, ул. Дурмон йули, 40',
  },
  phone: '+998 71 262-00-00',
  email: 'energy@academy.uz',
  workingHours: {
    uz: "Dushanba–Juma: 9:00–18:00",
    en: 'Monday–Friday: 9:00 AM–6:00 PM',
    ru: 'Понедельник–Пятница: 9:00–18:00',
  },
} as const;

/** Joriy tildagi manzil. Noma'lum til — o'zbekchaga tushadi. */
export function localizedAddress(lang: Lang): string {
  return CONTACT_INFO.address[lang] ?? CONTACT_INFO.address.uz;
}

/** Joriy tildagi ish vaqti. Noma'lum til — o'zbekchaga tushadi. */
export function localizedWorkingHours(lang: Lang): string {
  return CONTACT_INFO.workingHours[lang] ?? CONTACT_INFO.workingHours.uz;
}
