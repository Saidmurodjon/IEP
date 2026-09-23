import { useCallback, useState } from 'react';

/**
 * Admin ro'yxatlarida bir nechta yozuvni belgilab ommaviy amal (o'chirish,
 * qoralamaga o'tkazish) bajarish uchun umumiy holat. Bir xil naqsh bir
 * nechta admin sahifasida takrorlanadi, shuning uchun alohida hook.
 */
export function useBulkSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Ro'yxatdagi hammasi belgilangan bo'lsa — bekor qiladi, aks holda hammasini belgilaydi. */
  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, toggleAll, clear };
}
