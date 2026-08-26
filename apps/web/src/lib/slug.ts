/**
 * Sarlavhadan havola (`slug`) hosil qilish.
 *
 * O'zbek lotin yozuvidagi `o'`, `g'` va `ʻ`/`'` belgilari apostrofsiz
 * yoziladi (`o'zbekiston` → `ozbekiston`), kirill harflari
 * transliteratsiya qilinadi.
 */
const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC[char] ?? char)
    .join('')
    // Apostrofning barcha ko'rinishlari OLIB TASHLANADI, chiziqchaga
    // aylantirilmaydi: `o'zbekiston` → `ozbekiston`.
    .replace(/['’‘ʻʼ`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Ro'yxatda shunday `slug` bo'lsa oxiriga raqam qo'shadi: `nom-2`. */
export function uniqueSlug(base: string, existing: readonly string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}
