import { describe, it, expect, vi, afterEach } from 'vitest';
import { clientIp, createStore, overLimit } from '../rate-limit';

afterEach(() => vi.useRealTimers());

describe('clientIp', () => {
  it('Cloudflare sarlavhasiga ustunlik beradi', () => {
    const headers = new Headers({ 'CF-Connecting-IP': '1.1.1.1', 'X-Forwarded-For': '2.2.2.2' });
    expect(clientIp(headers)).toBe('1.1.1.1');
  });

  it('CF sarlavhasi bo\'lmasa X-Forwarded-For dagi BIRINCHI manzil olinadi', () => {
    expect(clientIp(new Headers({ 'X-Forwarded-For': '3.3.3.3, 4.4.4.4' }))).toBe('3.3.3.3');
  });

  it('manzil aniqlanmasa `unknown`', () => {
    expect(clientIp(new Headers())).toBe('unknown');
  });
});

describe('overLimit', () => {
  it('chegaragacha o\'tkazadi, undan keyin to\'xtatadi', () => {
    const store = createStore();
    expect(overLimit(store, 'ip', 3, 60_000)).toBe(false);
    expect(overLimit(store, 'ip', 3, 60_000)).toBe(false);
    expect(overLimit(store, 'ip', 3, 60_000)).toBe(false);
    expect(overLimit(store, 'ip', 3, 60_000)).toBe(true);
  });

  it('turli IP lar bir-biriga ta\'sir qilmaydi', () => {
    const store = createStore();
    expect(overLimit(store, 'a', 1, 60_000)).toBe(false);
    expect(overLimit(store, 'b', 1, 60_000)).toBe(false);
    expect(overLimit(store, 'a', 1, 60_000)).toBe(true);
  });

  it('oyna tugagach hisob noldan boshlanadi', () => {
    vi.useFakeTimers();
    const store = createStore();
    expect(overLimit(store, 'ip', 1, 60_000)).toBe(false);
    expect(overLimit(store, 'ip', 1, 60_000)).toBe(true);
    vi.advanceTimersByTime(60_001);
    expect(overLimit(store, 'ip', 1, 60_000)).toBe(false);
  });

  it('har bir store mustaqil', () => {
    const a = createStore();
    const b = createStore();
    expect(overLimit(a, 'ip', 1, 60_000)).toBe(false);
    expect(overLimit(b, 'ip', 1, 60_000)).toBe(false);
  });
});
