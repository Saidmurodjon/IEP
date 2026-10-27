import { describe, it, expect } from 'vitest';
import { fillMonths, fillYears, foldUnits, lastMonthKeys, monthWindowStart } from '../stats';

describe('lastMonthKeys', () => {
  it('yil chegarasidan o\'tadi va joriy oyni oxirgi qiladi', () => {
    const keys = lastMonthKeys(new Date('2026-02-10T12:00:00Z'));
    expect(keys).toHaveLength(12);
    expect(keys[0]).toBe('2025-03');
    expect(keys[10]).toBe('2026-01');
    expect(keys[11]).toBe('2026-02');
  });
  it('Toshkent vaqti bilan oy almashadi (UTC da hali oldingi oy)', () => {
    // 2026-01-31 20:00 UTC = 2026-02-01 01:00 Toshkent
    expect(lastMonthKeys(new Date('2026-01-31T20:00:00Z')).at(-1)).toBe('2026-02');
    expect(lastMonthKeys(new Date('2026-01-31T18:00:00Z')).at(-1)).toBe('2026-01');
  });
  it('oyna boshi Toshkent 00:00 ga to\'g\'ri keladi', () => {
    expect(monthWindowStart(new Date('2026-02-10T12:00:00Z')).toISOString())
      .toBe('2025-02-28T19:00:00.000Z');
  });
});

describe('fillMonths', () => {
  it('bo\'sh oylarni 0 bilan to\'ldiradi', () => {
    const keys = ['2025-12', '2026-01', '2026-02'];
    expect(fillMonths(keys, [{ month: '2026-01', count: 4 }])).toEqual([
      { month: '2025-12', count: 0 },
      { month: '2026-01', count: 4 },
      { month: '2026-02', count: 0 },
    ]);
  });
});

describe('fillYears', () => {
  it('maks yildan orqaga 8 yil, o\'sish tartibida', () => {
    const out = fillYears([{ year: 2024, count: 3 }, { year: 2020, count: 1 }]);
    expect(out.map((y) => y.year)).toEqual([2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
    expect(out[3].count).toBe(1);
    expect(out[7].count).toBe(3);
    expect(out[0].count).toBe(0);
  });
  it('ma\'lumot bo\'lmasa bo\'sh', () => {
    expect(fillYears([])).toEqual([]);
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
