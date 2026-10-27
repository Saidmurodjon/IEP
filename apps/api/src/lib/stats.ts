// Dashboard statistikasi uchun sof yordamchilar (bazaga tegmaydi, sinovga yaroqli).

/** Toshkent UTC+5, yozgi vaqt yo'q. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export interface MonthCount { month: string; count: number }
export interface YearCount { year: number; count: number }
export interface UnitCount {
  unitId: string;
  nameUz: string; nameEn: string; nameRu: string;
  count: number;
}

/** Toshkent vaqti bo'yicha joriy oy: [yil, oy(0-11)]. */
function tashkentYearMonth(now: Date): [number, number] {
  const t = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  return [t.getUTCFullYear(), t.getUTCMonth()];
}

/** Oxirgi `n` oy kalitlari (`YYYY-MM`), joriy oy bilan, eskisidan yangisiga. */
export function lastMonthKeys(now: Date, n = 12): string[] {
  const [y, m] = tashkentYearMonth(now);
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/** Oyna boshi: eng eski oyning 1-kuni 00:00 (Toshkent) — UTC lahzasi sifatida. */
export function monthWindowStart(now: Date, n = 12): Date {
  const [y, m] = tashkentYearMonth(now);
  return new Date(Date.UTC(y, m - (n - 1), 1) - TASHKENT_OFFSET_MS);
}

/** Bazadan kelgan oylarni kalitlarga joylab, bo'sh oylarni 0 bilan to'ldiradi. */
export function fillMonths(keys: string[], rows: MonthCount[]): MonthCount[] {
  const map = new Map(rows.map((r) => [r.month, r.count]));
  return keys.map((month) => ({ month, count: map.get(month) ?? 0 }));
}

/** Ma'lumotdagi eng katta yildan orqaga `n` yil, o'sish tartibida, bo'shlari 0. */
export function fillYears(rows: YearCount[], n = 8): YearCount[] {
  if (rows.length === 0) return [];
  const max = Math.max(...rows.map((r) => r.year));
  const map = new Map(rows.map((r) => [r.year, r.count]));
  const out: YearCount[] = [];
  for (let y = max - n + 1; y <= max; y++) out.push({ year: y, count: map.get(y) ?? 0 });
  return out;
}

export interface UnitRow {
  unitId: string | null;
  nameUz: string; nameEn: string; nameRu: string;
  count: number;
}

/** Eng ko'p `top` ta bo'linma; qolganlari va bo'linmasizlar "other" ga. 0 bo'lsa "other" qo'shilmaydi. */
export function foldUnits(rows: UnitRow[], top = 8): UnitCount[] {
  const withUnit = rows
    .filter((r): r is UnitRow & { unitId: string } => r.unitId !== null)
    .sort((a, b) => b.count - a.count);
  const head = withUnit.slice(0, top);
  const rest = withUnit.slice(top);
  const otherCount =
    rest.reduce((s, r) => s + r.count, 0) +
    rows.filter((r) => r.unitId === null).reduce((s, r) => s + r.count, 0);
  const out: UnitCount[] = head.map((r) => ({
    unitId: r.unitId, nameUz: r.nameUz, nameEn: r.nameEn, nameRu: r.nameRu, count: r.count,
  }));
  if (otherCount > 0) {
    out.push({ unitId: 'other', nameUz: '', nameEn: '', nameRu: '', count: otherCount });
  }
  return out;
}
