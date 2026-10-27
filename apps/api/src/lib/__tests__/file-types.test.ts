import { describe, it, expect } from 'vitest';
import { detectType, LIMITS, FORMAT_LABELS } from '../file-types';

describe('chart yuklash turi', () => {
  it('PDF aniqlanadi, lekin chart uchun ruxsat etilmagan', () => {
    const detected = detectType(new TextEncoder().encode('%PDF-1.7 ...'));
    expect(detected?.mime).toBe('application/pdf');
    expect(LIMITS.chart.mimes).not.toContain('application/pdf');
  });

  it('zip va doc chart uchun ruxsat etilmagan', () => {
    expect(LIMITS.chart.mimes).not.toContain('application/zip');
    expect(LIMITS.chart.mimes).not.toContain('application/msword');
  });

  it('faqat rasm formatlari, hajm 10 MB', () => {
    expect(LIMITS.chart.mimes).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    expect(LIMITS.chart.maxBytes).toBe(10 * 1024 * 1024);
    expect(FORMAT_LABELS.chart).toBe('JPEG, PNG, WebP');
  });
});
