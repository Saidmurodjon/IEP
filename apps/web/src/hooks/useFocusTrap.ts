import { useEffect, useRef, type RefObject } from 'react';

/** Klaviatura bilan yuriladigan elementlar. */
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Ochiq fokus-qopqonlar tartibda — masalan xodim rasmini kesish oynasi
 * (`PhotoCropModal`) admin formasi ochiq turgan holda ochiladi. Ikkalasi ham
 * `document`da `keydown` tinglaydi, shuning uchun faqat ENG TEPADAGI (eng
 * so'nggi ochilgan) qopqon `Escape`/`Tab`ni ushlashi kerak — aks holda
 * kesish oynasida `Escape` bosilsa orqadagi butun forma ham yopilib,
 * kiritilgan ma'lumot yo'qolib qoladi.
 */
let activeTraps: symbol[] = [];

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
  // `onClose` sahifalarda odatda memoizatsiyasiz yoziladi (har renderda yangi
  // funksiya). Uni pastdagi effektning bog'liqlik ro'yxatiga qo'ymaslik uchun
  // ref orqali saqlaymiz — aks holda foydalanuvchi formaga harf yozganda
  // (qayta render) effekt qayta ishga tushib, fokusni birinchi elementga
  // (odatda modalning yopish tugmasiga) qaytarib yuboradi.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const idRef = useRef<symbol>();
  if (!idRef.current) idRef.current = Symbol('focus-trap');

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const id = idRef.current as symbol;
    activeTraps.push(id);
    const isTopmost = () => activeTraps[activeTraps.length - 1] === id;

    const opener = document.activeElement as HTMLElement | null;
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost()) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current?.();
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
      activeTraps = activeTraps.filter((t) => t !== id);
      opener?.focus?.();
    };
    // `onClose` ataylab bog'liqlik ro'yxatida yo'q — yuqoridagi izohga qarang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active]);
}
