/**
 * Fayl turini **magic bayt**lar bo'yicha aniqlash.
 *
 * `Content-Type` sarlavhasi ham, fayl kengaytmasi ham mijoz tomonidan
 * yuboriladi va ularga ishonib bo'lmaydi: `.exe` faylni `.jpg` deb nomlash
 * va `image/jpeg` sarlavhasi bilan yuborish hech qanday to'siqqa uchramaydi.
 * Shuning uchun tur faqat fayl mazmunining boshidagi imzo bo'yicha aniqlanadi.
 *
 * SVG ATAYLAB qo'llab-quvvatlanmaydi: u XML matn, ichida `<script>` bo'lishi
 * mumkin va saqlangan XSS uchun keng ishlatiladigan yo'l.
 */

export type UploadKind = 'image' | 'photo' | 'document';

export interface DetectedType {
  mime: string;
  extension: string;
  isImage: boolean;
}

/** Baytlar ketma-ketligi berilgan o'rindan mos keladimi. */
function matches(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

/**
 * Fayl imzosi bo'yicha turni aniqlaydi. Tanilmasa `null` — bu holda fayl
 * rad etiladi (allowlist yondashuvi, blocklist emas).
 */
export function detectType(bytes: Uint8Array): DetectedType | null {
  // JPEG: FF D8 FF
  if (matches(bytes, [0xff, 0xd8, 0xff])) {
    return { mime: 'image/jpeg', extension: 'jpg', isImage: true };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: 'image/png', extension: 'png', isImage: true };
  }
  // WebP: "RIFF" .... "WEBP"
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    return { mime: 'image/webp', extension: 'webp', isImage: true };
  }
  // PDF: "%PDF"
  if (ascii(bytes, 0, 4) === '%PDF') {
    return { mime: 'application/pdf', extension: 'pdf', isImage: false };
  }
  // DOCX / XLSX — ZIP konteyner: "PK\x03\x04". Ichki tuzilmani Workers'da
  // ochib ko'rmaymiz, shuning uchun ikkalasi ham shu imzo bilan keladi.
  if (matches(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return { mime: 'application/zip', extension: 'zip', isImage: false };
  }
  // Eski DOC / XLS — OLE2 konteyner: D0 CF 11 E0 A1 B1 1A E1
  if (matches(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    return { mime: 'application/msword', extension: 'doc', isImage: false };
  }
  return null;
}

/** Har bir yuklash turi uchun chegaralar. */
export const LIMITS: Record<UploadKind, { maxBytes: number; label: string; mimes: string[] }> = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    label: '5 MB',
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  photo: {
    maxBytes: 2 * 1024 * 1024,
    label: '2 MB',
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  document: {
    maxBytes: 20 * 1024 * 1024,
    label: '20 MB',
    mimes: ['application/pdf', 'application/zip', 'application/msword'],
  },
};

/** Foydalanuvchiga ko'rsatiladigan format ro'yxati. */
export const FORMAT_LABELS: Record<UploadKind, string> = {
  image: 'JPEG, PNG, WebP',
  photo: 'JPEG, PNG, WebP',
  document: 'PDF, DOC, DOCX, XLS, XLSX',
};

/**
 * ZIP/OLE konteyner uchun haqiqiy hujjat kengaytmasini mijoz bergan nomdan
 * oladi. Konteyner turi allaqachon magic bayt bilan tasdiqlangan, bu yerda
 * faqat `docx` va `xlsx` ni ajratamiz — xavfsizlikka ta'sir qilmaydi.
 */
export function documentExtension(detected: DetectedType, originalName: string): string {
  const fromName = originalName.toLowerCase().split('.').pop() ?? '';
  if (detected.extension === 'zip' && ['docx', 'xlsx'].includes(fromName)) return fromName;
  if (detected.extension === 'doc' && ['doc', 'xls'].includes(fromName)) return fromName;
  return detected.extension;
}
