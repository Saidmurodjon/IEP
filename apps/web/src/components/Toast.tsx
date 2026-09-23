import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';
import { toApiError, type ApiError } from '@/lib/api-error';

type ToastKind = 'success' | 'error';

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
  /** Xato kodi — moderator uni texnik xodimga aytishi mumkin. */
  code?: string;
}

interface ToastApi {
  /** Muvaffaqiyat xabari. To'rt soniyadan keyin o'zi yo'qoladi. */
  success: (text: string) => void;
  /** Xato xabari. Foydalanuvchi yopgunicha qoladi. */
  showError: (error: unknown) => void;
  /**
   * Tayyor matn bilan xato xabari — API xato kodiga bog'liq bo'lmagan
   * holatlar uchun (masalan ommaviy amalning qisman muvaffaqiyatsizligi).
   */
  error: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Muvaffaqiyat xabari shu muddatdan keyin o'zi yo'qoladi. */
const SUCCESS_TIMEOUT_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, text: string, code?: string) => {
      const id = nextId.current++;
      setItems((list) => [...list, { id, kind, text, code }]);
      // Xato xabarlari ATAYLAB o'zi yo'qolmaydi — moderator kodni o'qib
      // ulgurishi kerak.
      if (kind === 'success') {
        setTimeout(() => remove(id), SUCCESS_TIMEOUT_MS);
      }
    },
    [remove]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (text: string) => push('success', text),
      error: (text: string) => push('error', text),
      showError: (error: unknown) => {
        const apiError: ApiError = toApiError(error);
        const message = t(`errors.${apiError.code}`, {
          ...(apiError.meta ?? {}),
          defaultValue: t('errors.SERVER_ERROR'),
        });
        push('error', message, apiError.code);
      },
    }),
    [push, t]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))]">
        {items.map((item) => (
          <div
            key={item.id}
            role={item.kind === 'error' ? 'alert' : 'status'}
            className={clsx(
              'flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white',
              item.kind === 'success' ? 'border-emerald-200' : 'border-red-200'
            )}
          >
            {item.kind === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
              {item.code && (
                <p className="mt-1 text-[11px] font-mono text-gray-500">{item.code}</p>
              )}
            </div>
            <button
              onClick={() => remove(item.id)}
              aria-label={t('common.close')}
              className="text-gray-500 hover:text-gray-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Admin paneldagi barcha xabarlar shu hook orqali ko'rsatiladi. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
