import { describe, it, expect } from 'vitest';
import { fillPeriods, fillYearRange, foldUnits, parseDay, resolveRange } from '../stats';

describe('parseDay', () => {
  it('to\'g\'ri sanani qabul qiladi, mavjud bo\'lmaganini rad etadi', () => {
    expect(parseDay('2026-02-28')?.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(parseDay('2026-02-30')).toBeNull();
    expect(parseDay('2026-2-1')).toBeNull();
  });
});

describe('resolveRange', () => {
  it('standart: oxirgi 12 oy, oylik, yil chegarasidan o\'tadi', () => {
    const r = resolveRange(new Date('2026-02-10T12:00:00Z'))!;
    expect(r.granularity).toBe('month');
    expect(r.keys).toHaveLength(12);
    expect(r.keys[0]).toBe('2025-03');
    expect(r.keys[11]).toBe('2026-02');
    expect(r.from).toBe('2025-03-01');
    expect(r.to).toBe('2026-02-10');
  });
  it('bugun Toshkent vaqti bilan aniqlanadi', () => {
    // 2026-01-31 20:00 UTC = 2026-02-01 01:00 Toshkent
    expect(resolveRange(new Date('2026-01-31T20:00:00Z'))!.to).toBe('2026-02-01');
  });
  it('chegaralar Toshkent 00:00, `to` kuni to\'liq kiradi', () => {
    const r = resolveRange(new Date(), '2026-03-01', '2026-03-07')!;
    expect(r.start.toISOString()).toBe('2026-02-28T19:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-03-07T19:00:00.000Z');
  });
  it('62 kungacha kunlik, undan uzunrog\'i oylik', () => {
    const d = resolveRange(new Date(), '2026-01-01', '2026-03-03')!;
    expect(d.granularity).toBe('day');
    expect(d.keys).toHaveLength(62);
    expect(d.keys[0]).toBe('2026-01-01');
    expect(d.keys.at(-1)).toBe('2026-03-03');
    const m = resolveRange(new Date(), '2026-01-01', '2026-03-04')!;
    expect(m.granularity).toBe('month');
    expect(m.keys).toEqual(['2026-01', '2026-02', '2026-03']);
  });
  it('noto\'g\'ri oraliqni rad etadi', () => {
    expect(resolveRange(new Date(), '2026-03-02', '2026-03-01')).toBeNull();
    expect(resolveRange(new Date(), '2026-02-31', '2026-03-01')).toBeNull();
    expect(resolveRange(new Date(), '2000-01-01', '2026-03-01')).toBeNull();
  });
});

describe('fillPeriods', () => {
  it('bo\'sh davrlarni 0 bilan to\'ldiradi', () => {
    const keys = ['2025-12', '2026-01', '2026-02'];
    expect(fillPeriods(keys, [{ period: '2026-01', count: 4 }])).toEqual([
      { period: '2025-12', count: 0 },
      { period: '2026-01', count: 4 },
      { period: '2026-02', count: 0 },
    ]);
  });
});

describe('fillYearRange', () => {
  it('oraliqdagi har bir yil, o\'sish tartibida', () => {
    const out = fillYearRange([{ year: 2024, count: 3 }], 2023, 2025);
    expect(out).toEqual([
      { year: 2023, count: 0 }, { year: 2024, count: 3 }, { year: 2025, count: 0 },
    ]);
  });
});

describe('foldUnits', () => {
  const mk = (i: number, count: number) => ({
    unitId: `u${i}`, nameUz: `U${i}`, nameEn: `E${i}`, nameRu: `R${i}`, count,
  });
  it('eng ko\'p 8 tani saqlaydi, qolgan va null bo\'linmani "other" ga yig\'adi', () => {
    const rows = [...Array.from({ length: 10 }, (_, i) => mk(i, 10 - i)), { ...mk(99, 5), unitId: null }];
    const out = foldUnits(rows);
    expect(out).toHaveLength(9);
    expect(out[0].count).toBe(10);
    expect(out[8]).toEqual({ unitId: 'other', nameUz: '', nameEn: '', nameRu: '', count: 2 + 1 + 5 });
  });
  it('"other" 0 bo\'lsa qo\'shilmaydi', () => {
    expect(foldUnits([mk(1, 3), mk(2, 5)]).map((u) => u.unitId)).toEqual(['u2', 'u1']);
  });
  it('faqat null bo\'linma bo\'lsa "other" chiqadi', () => {
    expect(foldUnits([{ ...mk(0, 4), unitId: null }])).toEqual([
      { unitId: 'other', nameUz: '', nameEn: '', nameRu: '', count: 4 },
    ]);
  });
});
