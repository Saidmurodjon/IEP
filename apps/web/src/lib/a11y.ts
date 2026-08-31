/**
 * Imkoniyati cheklangan foydalanuvchilar uchun ko'rinish sozlamalari
 * (373-son qaror, 11-band: «qo'shimcha qulayliklar»).
 *
 * Sozlamalar `html` elementiga sinf qo'shish orqali qo'llanadi, CSS
 * o'zgaruvchilari esa `index.css` da. **Saytning alohida versiyasi
 * yaratilmaydi** — uni qo'llab-quvvatlash ikki barobar ish talab qilardi.
 */

export const FONT_SIZES = ['normal', 'large', 'xlarge'] as const;
export type FontSize = (typeof FONT_SIZES)[number];

export interface A11ySettings {
  fontSize: FontSize;
  /** `high` — oq fon, qora matn, bezaklar soddalashtiriladi. */
  contrast: 'normal' | 'high';
  /** `off` — bezak rasmlari yashiriladi, mazmunlilari o'rniga `alt` matni chiqadi. */
  images: 'on' | 'off';
  /** `wide` — harflar va so'zlar orasi kengayadi, qatorlar bo'shroq. */
  spacing: 'normal' | 'wide';
}

export const DEFAULT_A11Y: A11ySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  images: 'on',
  spacing: 'normal',
};

/** `localStorage` kaliti. Tanlov keyingi tashrifda tiklanadi. */
export const A11Y_STORAGE_KEY = 'a11y-settings';

/** Sozlamaga mos `html` sinflari. Bo'sh satr — sinf qo'shilmaydi. */
export function classesFor(settings: A11ySettings): string[] {
  return [
    settings.fontSize === 'large' ? 'a11y-font-large' : '',
    settings.fontSize === 'xlarge' ? 'a11y-font-xlarge' : '',
    settings.contrast === 'high' ? 'a11y-contrast' : '',
    settings.images === 'off' ? 'a11y-no-images' : '',
    settings.spacing === 'wide' ? 'a11y-spacing' : '',
  ].filter(Boolean);
}

/** Barcha mumkin bo'lgan sinflar — eskisini olib tashlash uchun kerak. */
export const ALL_A11Y_CLASSES = [
  'a11y-font-large', 'a11y-font-xlarge', 'a11y-contrast', 'a11y-no-images', 'a11y-spacing',
];

export function isDefault(settings: A11ySettings): boolean {
  return (Object.keys(DEFAULT_A11Y) as (keyof A11ySettings)[])
    .every((key) => settings[key] === DEFAULT_A11Y[key]);
}

/** Saqlangan qiymatni o'qiydi. Buzilgan yoki notanish qiymat — sukut bo'yicha. */
export function readStoredSettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y;
    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    return {
      fontSize: FONT_SIZES.includes(parsed.fontSize as FontSize) ? (parsed.fontSize as FontSize) : 'normal',
      contrast: parsed.contrast === 'high' ? 'high' : 'normal',
      images: parsed.images === 'off' ? 'off' : 'on',
      spacing: parsed.spacing === 'wide' ? 'wide' : 'normal',
    };
  } catch {
    // `localStorage` o'chirilgan yoki JSON buzilgan — sukut bo'yicha ishlaymiz.
    return DEFAULT_A11Y;
  }
}

/**
 * Boy matn (rich text) ichidagi rasmlarni `alt` tavsifiga almashtiradi.
 *
 * Almashtirish DOM orqali bajariladi, **regex bilan emas**: `alt` qiymati
 * ichida `>` bo'lsa (masalan `alt="<script>"`), regex tegni noto'g'ri joyda
 * tugatib qo'yardi. `textContent` esa matnni o'zi ekranlaydi, shuning uchun
 * qo'lda `escape` qilish ham kerak emas — ikki marta ekranlash `&amp;` ni
 * `&amp;amp;` ga aylantirib yuborardi.
 *
 * **Tartib:** bu funksiya `sanitizeHtml()` dan KEYIN chaqiriladi, aks holda
 * qo'shilgan `class` atributi tozalashda tushib qolardi.
 *
 * `alt` bo'sh bo'lsa rasm bezak hisoblanadi va butunlay olib tashlanadi.
 */
export function replaceImagesWithAlt(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  template.content.querySelectorAll('img').forEach((image) => {
    const alt = (image.getAttribute('alt') ?? '').trim();
    if (!alt) {
      image.remove();
      return;
    }
    const paragraph = document.createElement('p');
    paragraph.className = 'a11y-alt';
    paragraph.textContent = alt;
    image.replaceWith(paragraph);
  });

  return template.innerHTML;
}
