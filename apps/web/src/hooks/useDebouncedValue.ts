import { useEffect, useState } from 'react';

/**
 * Qiymatni kechiktirib qaytaradi.
 *
 * Qidiruvda har bir bosilgan harf uchun so'rov yubormaslik uchun ishlatiladi
 * (topshiriq 10, A3: kamida 300 ms). Qiymat o'zgarsa oldingi taymer bekor
 * qilinadi, ya'ni so'rov faqat foydalanuvchi to'xtaganda ketadi.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
