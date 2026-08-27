/**
 * Xat shablonlari.
 *
 * Matnlar `locales/*.json` da EMAS: ular serverda hosil qilinadi va
 * `react-i18next` u yerda mavjud emas. Barcha xatlar **o'zbek tilida**.
 *
 * QOIDA: xat matnida murojaatning O'ZI takrorlanmaydi va telefon raqami
 * yozilmaydi. Pochta qutisi buzilgan bo'lsa, shaxsiy ma'lumot uchinchi
 * shaxsga tushib qolmasligi kerak (09-topshiriq, 3-bo'lim).
 */

export interface AppealMailContext {
  ticketNumber: string;
  /** Holatni tekshirish sahifasining to'liq manzili. */
  statusUrl: string;
  /** `26.08.2026` ko'rinishida. */
  receivedAt: string;
  subject?: string;
  /** Admin paneldagi murojaat havolasi — faqat xodimga yuboriladigan xatda. */
  adminUrl?: string;
}

/** `26.08.2026` — O'zbekistonda qabul qilingan shakl. */
export function formatDateUz(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

/**
 * Fuqaroga tasdiq xati.
 * Murojaat MATNI ataylab yo'q — faqat raqam, sana va havola.
 */
export function citizenReceipt(ctx: AppealMailContext): { subject: string; text: string } {
  return {
    subject: 'Murojaatingiz qabul qilindi',
    text: [
      'Assalomu alaykum!',
      '',
      "Energetika muammolari institutiga yo'llagan murojaatingiz qabul qilindi.",
      '',
      `Murojaat raqami: ${ctx.ticketNumber}`,
      `Qabul qilingan sana: ${ctx.receivedAt}`,
      '',
      "Murojaatingiz ko'rib chiqilish holatini quyidagi sahifada kuzatishingiz mumkin:",
      ctx.statusUrl,
      '',
      'Holatni tekshirish uchun murojaat raqami va shu elektron pochta manzili kerak bo\'ladi.',
      '',
      'Bu xat avtomatik yuborildi, unga javob yozish shart emas.',
      '',
      'Hurmat bilan,',
      'Energetika muammolari instituti',
    ].join('\n'),
  };
}

/**
 * Institut xodimiga bildirishnoma.
 * Fuqaroning telefon raqami va murojaat matni qo'shilmaydi — ular admin panelda.
 */
export function staffNotification(ctx: AppealMailContext): { subject: string; text: string } {
  return {
    subject: `Yangi murojaat: ${ctx.ticketNumber}`,
    text: [
      'Saytga yangi murojaat keldi.',
      '',
      `Murojaat raqami: ${ctx.ticketNumber}`,
      `Mavzusi: ${ctx.subject ?? '—'}`,
      `Kelgan sana: ${ctx.receivedAt}`,
      '',
      "Murojaat matni va aloqa ma'lumotlari admin panelda:",
      ctx.adminUrl ?? '',
      '',
      'Bu xat avtomatik yuborildi.',
    ].join('\n'),
  };
}

/** Murojaat `answered` holatiga o'tkazilganda fuqaroga yuboriladi. */
export function citizenAnswered(ctx: AppealMailContext): { subject: string; text: string } {
  return {
    subject: "Murojaatingiz ko'rib chiqildi",
    text: [
      'Assalomu alaykum!',
      '',
      `${ctx.ticketNumber} raqamli murojaatingiz ko'rib chiqildi.`,
      '',
      'Holatni quyidagi sahifada tekshirishingiz mumkin:',
      ctx.statusUrl,
      '',
      'Bu xat avtomatik yuborildi, unga javob yozish shart emas.',
      '',
      'Hurmat bilan,',
      'Energetika muammolari instituti',
    ].join('\n'),
  };
}
