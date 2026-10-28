import { describe, it, expect, vi, afterEach } from 'vitest';
import { clientIp, createStore, overLimit, withProxyClientIp } from '../rate-limit';

afterEach(() => vi.useRealTimers());

describe('clientIp', () => {
  it('faqat CF-Connecting-IP olinadi', () => {
    const headers = new Headers({ 'CF-Connecting-IP': '1.1.1.1', 'X-Forwarded-For': '2.2.2.2' });
    expect(clientIp(headers)).toBe('1.1.1.1');
  });

  it('X-Forwarded-For ga to\'g\'ridan-to\'g\'ri ishonilmaydi', () => {
    expect(clientIp(new Headers({ 'X-Forwarded-For': '3.3.3.3, 4.4.4.4' }))).toBe('unknown');
  });

  it('manzil aniqlanmasa `unknown`', () => {
    expect(clientIp(new Headers())).toBe('unknown');
  });
});

describe('withProxyClientIp', () => {
  const ipOf = (headers: Record<string, string>) =>
    clientIp(withProxyClientIp(new Request('http://x/', { headers })).headers);

  it('proksi qo\'shgan OXIRGI manzil olinadi, mijoz yozgan bosh qismi emas', () => {
    expect(ipOf({ 'X-Forwarded-For': '6.6.6.6, 5.5.5.5' })).toBe('5.5.5.5');
  });

  it('mijoz yuborgan CF-Connecting-IP o\'chiriladi', () => {
    expect(ipOf({ 'CF-Connecting-IP': '6.6.6.6', 'X-Forwarded-For': '5.5.5.5' })).toBe('5.5.5.5');
    expect(ipOf({ 'CF-Connecting-IP': '6.6.6.6' })).toBe('unknown');
  });

  it('POST tanasi saqlanadi', async () => {
    const req = withProxyClientIp(new Request('http://x/', { method: 'POST', body: '{"a":1}' }));
    expect(await req.text()).toBe('{"a":1}');
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
