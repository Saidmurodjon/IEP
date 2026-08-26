import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Saqlanmagan o'zgarishlar bo'lganda sahifadan chiqishga urinilsa
 * brauzer ogohlantirishini ko'rsatadi (07-topshiriq, 9-bo'lim).
 */
export function useUnsavedWarning(dirty: boolean): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Zamonaviy brauzerlar o'z matnini ko'rsatadi, lekin qiymat berilishi shart.
      event.returnValue = t('admin.unsaved_warning');
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, t]);
}
