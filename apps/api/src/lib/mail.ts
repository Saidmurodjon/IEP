import type { Env } from '../index';

/**
 * Elektron xat yuborish — Resend orqali.
 *
 * Resend oddiy HTTP so'rov bilan ishlaydi va Workers muhitiga to'g'ri keladi:
 * SMTP kutubxonasi kerak emas.
 *
 * **Muhim cheklov.** O'z domeningizdan xat yuborish uchun Resend'da domen
 * tasdiqlangan bo'lishi shart (DNS yozuvlari). `iep.uz` ulanmaguncha buni
 * bajarib bo'lmaydi. Shuning uchun jo'natuvchi manzil `MAIL_FROM` secret'ida:
 * domen tayyor bo'lgach faqat shu qiymat o'zgartiriladi, KOD TEGILMAYDI.
 *
 * Sinov bosqichida Resend'ning `onboarding@resend.dev` manzilidan foydalanish
 * mumkin, LEKIN u faqat Resend hisobi egasining pochtasiga xat yuboradi —
 * boshqa manzillarga yuborilgan xat rad etiladi. Shu sababli sinovni faqat
 * o'z pochtangiz bilan o'tkazing.
 *
 * Bepul tarif chegaralari vaqt o'tishi bilan o'zgaradi — `resend.com` da
 * tekshiring.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type MailResult =
  | { ok: true }
  /** Kalit yoki jo'natuvchi sozlanmagan — bu XATO EMAS, sozlash masalasi. */
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'send_failed'; detail: string };

export interface MailInput {
  to: string;
  subject: string;
  /** Oddiy matn. HTML ishlatilmaydi — xat sodda va ishonchli bo'lsin. */
  text: string;
}

/**
 * Xat yuboradi. **Hech qachon `throw` qilmaydi** — chaqiruvchi kod uchun
 * xavfsiz: xat yuborilmagani uchun fuqaroning murojaati yo'qolmasligi kerak.
 *
 * `lib/env.ts` dagi yondashuv saqlanadi: secret uchun default qiymat yo'q.
 */
export async function sendMail(env: Env, input: MailInput): Promise<MailResult> {
  const apiKey = env?.RESEND_API_KEY;
  const from = env?.MAIL_FROM;

  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return { ok: false, reason: 'not_configured' };
  }
  if (typeof from !== 'string' || from.length === 0) {
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, text: input.text }),
    });

    if (!response.ok) {
      // Javob matnida kalit bo'lmaydi, lekin baribir qisqartiramiz.
      const detail = (await response.text()).slice(0, 300);
      return { ok: false, reason: 'send_failed', detail: `${response.status}: ${detail}` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: 'send_failed',
      detail: error instanceof Error ? error.message : 'unknown',
    };
  }
}
