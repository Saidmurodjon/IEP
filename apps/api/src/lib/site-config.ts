/**
 * Sayt bo'yicha STATIK qiymatlar.
 *
 * Ilgari admin paneldagi «Sozlamalar» orqali bazada (`site_settings`) edi,
 * lekin amalda o'zgarmaydi — shuning uchun kodga ko'chirildi. O'zgartirish
 * kerak bo'lsa: shu faylni tahrirlab, qayta deploy qiling.
 *
 * Sayt manzili alohida yozilmaydi — `FRONTEND_URL` (`lib/env.ts`) ishlatiladi.
 */

/** Yangi murojaat haqida bildirishnoma yuboriladigan pochta. */
export const APPEALS_EMAIL = 'energy@academy.uz';

/** Yopilgan murojaatlar shuncha kundan keyin tozalanadi (`POST /api/contact/cleanup`). */
export const APPEALS_RETENTION_DAYS = 365;
