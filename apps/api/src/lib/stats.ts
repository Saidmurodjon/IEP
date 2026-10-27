// Dashboard statistikasi uchun sof yordamchilar (bazaga tegmaydi, sinovga yaroqli).

/** Toshkent UTC+5, yozgi vaqt yo'q. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Davr kaliti: `YYYY-MM-DD` (kunlik) yoki `YYYY-MM` (oylik). */
export interface PeriodCount { period: string; count: number }
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

export type Granularity = 'day' | 'month';

/** Oraliq shu kundan oshmasa kunlik, aks holda oylik guruhlanadi. */
export const DAY_GRANULARITY_MAX_DAYS = 62;
/** Ruxsat etilgan eng uzun oraliq (kun) — ~10 yil. */
export const MAX_RANGE_DAYS = 3660;

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` → shu kunning UTC yarim tuni (kalendar kuni sifatida). Noto'g'ri sana — `null`. */
export function parseDay(s: string): Date | null {
  const m = DAY_RE.exec(s);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === s ? d : null;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => d.toISOString().slice(0, 7);

export interface StatsRange {
  /** Kalendar kunlari, `YYYY-MM-DD` (ikkalasi ham kiradi). */
  from: string;
  to: string;
  /** SQL uchun: `from` kuni 00:00 (Toshkent) va `to` dan keyingi kun 00:00 (Toshkent). */
  start: Date;
  end: Date;
  granularity: Granularity;
  keys: string[];
}

/**
 * So'rovdagi `from`/`to` dan oraliq yasaydi. Berilmasa — oxirgi 12 oy (joriy oy bilan).
 * Xato (noto'g'ri sana, `from > to`, juda uzun oraliq) — `null`.
 */
export function resolveRange(now: Date, from?: string, to?: string): StatsRange | null {
  const [y, m] = tashkentYearMonth(now);
  const today = dayKey(new Date(now.getTime() + TASHKENT_OFFSET_MS));
  const fromDay = from ? parseDay(from) : new Date(Date.UTC(y, m - 11, 1));
  const toDay = parseDay(to ?? today);
  if (!fromDay || !toDay || fromDay > toDay) return null;
  const spanDays = (toDay.getTime() - fromDay.getTime()) / DAY_MS + 1;
  if (spanDays > MAX_RANGE_DAYS) return null;

  const granularity: Granularity = spanDays <= DAY_GRANULARITY_MAX_DAYS ? 'day' : 'month';
  const keys: string[] = [];
  if (granularity === 'day') {
    for (let t = fromDay.getTime(); t <= toDay.getTime(); t += DAY_MS) keys.push(dayKey(new Date(t)));
  } else {
    const end = monthKey(toDay);
    for (let i = 0; ; i++) {
      const k = monthKey(new Date(Date.UTC(fromDay.getUTCFullYear(), fromDay.getUTCMonth() + i, 1)));
      keys.push(k);
      if (k === end) break;
    }
  }
  return {
    from: dayKey(fromDay),
    to: dayKey(toDay),
    start: new Date(fromDay.getTime() - TASHKENT_OFFSET_MS),
    end: new Date(toDay.getTime() + DAY_MS - TASHKENT_OFFSET_MS),
    granularity,
    keys,
  };
}

/** `fromYear..toYear` oralig'idagi har bir yil, bo'shlari 0. */
export function fillYearRange(rows: YearCount[], fromYear: number, toYear: number): YearCount[] {
  const map = new Map(rows.map((r) => [r.year, r.count]));
  const out: YearCount[] = [];
  for (let y = fromYear; y <= toYear; y++) out.push({ year: y, count: map.get(y) ?? 0 });
  return out;
}

/** Bazadan kelgan davrlarni kalitlarga joylab, bo'shlarini 0 bilan to'ldiradi. */
export function fillPeriods(keys: string[], rows: PeriodCount[]): PeriodCount[] {
  const map = new Map(rows.map((r) => [r.period, r.count]));
  return keys.map((period) => ({ period, count: map.get(period) ?? 0 }));
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
