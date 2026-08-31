import { AlertCircle } from 'lucide-react';

/**
 * Forma maydonidagi xato xabari.
 *
 * Xato FAQAT rang bilan ko'rsatilmaydi (373-son qaror talabi, topshiriq 10B4):
 * ikonka va matn ham bo'ladi. `id` maydonning `aria-describedby` siga
 * ulanadi, `role="alert"` esa ekran o'qigichga darhol e'lon qiladi.
 */
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-red-600 text-xs mt-1 flex items-start gap-1">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
