import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, FileText, Loader2 } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import { contactApi } from '@/lib/api';
import { toApiError } from '@/lib/api-error';
import { formatDate } from '@/lib/date';

interface AppealStatus {
  ticketNumber: string;
  status: 'new' | 'in_review' | 'answered' | 'closed';
  createdAt: string;
  statusChangedAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-primary-50 text-primary-700 border-primary-200',
  in_review: 'bg-amber-50 text-amber-800 border-amber-200',
  answered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

/**
 * Murojaat holatini tekshirish.
 *
 * Raqam VA pochta manzili ikkalasi ham talab qilinadi — raqamlar ketma-ket
 * bo'lgani uchun faqat raqam bilan begona odam boshqalarning murojaatini
 * ko'rib chiqa olardi.
 */
export default function AppealStatusPage() {
  const { t } = useTranslation();
  const [result, setResult] = useState<AppealStatus | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    ticket: z.string().min(1, t('appeal.ticket_required')),
    email: z.string().email(t('contact.err_email')),
  });
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    setErrorText(null);
    try {
      const response = await contactApi.status(data.ticket.trim(), data.email.trim());
      setResult(response.data.data as AppealStatus);
    } catch (error) {
      const apiError = toApiError(error);
      // Sabab AYTILMAYDI: "raqam yo'q" va "pochta mos emas" javoblari farq
      // qilsa, raqamlarni birma-bir sinab ko'rish mumkin bo'lardi.
      setErrorText(
        apiError.code === 'RATE_LIMITED' ? t('appeal.too_many') : t('appeal.not_found')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead title={t('appeal.title')} description={t('appeal.subtitle')} />

      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{t('appeal.title')}</h1>
          <p className="text-primary-200">{t('appeal.subtitle')}</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
            <p className="text-sm text-gray-500">{t('appeal.hint')}</p>

            <div>
              <label className="label">{t('appeal.ticket')} *</label>
              <input
                {...register('ticket')}
                className="input"
                placeholder="M-2026-0001"
                autoComplete="off"
              />
              {errors.ticket && <p className="text-red-500 text-xs mt-1">{errors.ticket.message}</p>}
            </div>

            <div>
              <label className="label">{t('contact.email')} *</label>
              <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary gap-2 px-6 py-2.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t('appeal.check')}
            </button>
          </form>

          {errorText && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {errorText}
            </div>
          )}

          {result && (
            <div className="mt-5 card p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-700 p-2.5 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm text-gray-500">{result.ticketNumber}</div>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_STYLE[result.status]}`}>
                      {t(`appeal.status_${result.status}`)}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-gray-400">{t('appeal.received')}:</dt>
                      <dd className="text-gray-700">{formatDate(result.createdAt)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-400">{t('appeal.changed')}:</dt>
                      <dd className="text-gray-700">{formatDate(result.statusChangedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
