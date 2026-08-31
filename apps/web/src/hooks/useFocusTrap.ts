import { useEffect, type RefObject } from 'react';

/** Klaviatura bilan yuriladigan elementlar. */
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Ochiq oyna ichida fokusni ushlab turadi.
 *
 * `Tab` oxirgi elementdan keyin birinchisiga qaytadi, `Shift+Tab` teskarisiga.
 * Ochilganda fokus oyna ichiga o'tadi, yopilganda oynani ochgan elementga
 * qaytariladi — foydalanuvchi qayerda edi, o'sha yerda qoladi.
 *
 * `Escape` ni oynaning o'zi ushlaydi (`onClose`).
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose?: () => void
): void {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const opener = document.activeElement as HTMLElement | null;
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === firstItem || !container.contains(current))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && current === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      opener?.focus?.();
    };
  }, [ref, active, onClose]);
}
