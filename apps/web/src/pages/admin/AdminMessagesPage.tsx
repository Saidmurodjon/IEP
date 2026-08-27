import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Mail, Phone, ChevronDown, ChevronRight, Send } from 'lucide-react';
import clsx from 'clsx';
import { contactApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { formatDateTime } from '@/lib/date';

type AppealStatus = 'new' | 'in_review' | 'answered' | 'closed';

interface Appeal {
  id: string;
  ticketNumber: string;
  name: string; email: string; phone?: string | null;
  subject: string; message: string;
  status: AppealStatus;
  createdAt: string;
  statusChangedAt: string;
  answeredAt?: string | null;
  answerNote?: string | null;
  notifiedAt?: string | null;
}

const STATUS_STYLE: Record<AppealStatus, string> = {
  new: 'bg-primary-50 text-primary-700 border-primary-200',
  in_review: 'bg-amber-50 text-amber-800 border-amber-200',
  answered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUSES: AppealStatus[] = ['new', 'in_review', 'answered', 'closed'];

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', filter],
    queryFn: () => contactApi.list(1, filter),
  });

  const appeals: Appeal[] = data?.data?.data ?? [];
  const unanswered: number = data?.data?.unanswered ?? 0;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-messages'] });
    qc.invalidateQueries({ queryKey: ['admin-msgs'] });
  };

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { status?: string; answerNote?: string } }) =>
      contactApi.update(id, values),
    onSuccess: () => { refresh(); toast.success(t('toast.saved')); },
    onError: (error) => toast.showError(error),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => { refresh(); setOpenId(null); toast.success(t('toast.saved')); },
    onError: (error) => toast.showError(error),
  });

  /**
   * `answered` holatiga o'tkazish fuqaroga XAT YUBORADI, shuning uchun
   * tasdiq so'raladi — tasodifan bosib qo'yish natijasida noto'g'ri xat
   * ketmasligi kerak (09-topshiriq, 6-bo'lim).
   */
  const changeStatus = (appeal: Appeal, status: AppealStatus) => {
    if (status === 'answered' && !confirm(t('appeals.confirm_answered'))) return;
    updateMut.mutate({ id: appeal.id, values: { status } });
  };

  const toggle = (appeal: Appeal) => {
    const next = openId === appeal.id ? null : appeal.id;
    setOpenId(next);
    setNoteDraft(next ? (appeal.answerNote ?? '') : '');
  };

  return (
    <>
      <Helmet><title>{t('admin.messages')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.messages')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('appeals.unanswered')}: <span className="font-semibold text-gray-700">{unanswered}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">{t('appeals.filter')}</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
              <option value="">{t('logs.all')}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{t(`appeal.status_${status}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && appeals.length === 0 && (
          <EmptyState icon={Mail} title={t('appeals.empty')} hint={t('appeals.empty_hint')} />
        )}

        <div className="space-y-2">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className={clsx('card', appeal.status === 'new' && 'border-l-4 border-l-primary-500')}
            >
              <button
                onClick={() => toggle(appeal)}
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                {openId === appeal.id ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{appeal.ticketNumber}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_STYLE[appeal.status])}>
                      {t(`appeal.status_${appeal.status}`)}
                    </span>
                    {!appeal.notifiedAt && (
                      <span className="text-xs text-amber-700" title={t('appeals.not_notified_hint')}>
                        {t('appeals.not_notified')}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 truncate">{appeal.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {appeal.name} · {formatDateTime(appeal.createdAt)}
                  </p>
                </div>
              </button>

              {openId === appeal.id && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/60">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a href={`mailto:${appeal.email}`} className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
                      <Mail className="h-3.5 w-3.5" /> {appeal.email}
                    </a>
                    {appeal.phone && (
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <Phone className="h-3.5 w-3.5 text-gray-400" /> {appeal.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">{t('appeals.message')}</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-3">
                      {appeal.message}
                    </p>
                  </div>

                  <div>
                    <label className="label">{t('appeals.note')}</label>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      rows={2}
                      className="input resize-none"
                      placeholder={t('appeals.note_placeholder')}
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('appeals.note_hint')}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter((status) => status !== appeal.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => changeStatus(appeal, status)}
                        className={clsx(
                          'text-sm px-4 py-2 rounded-lg border transition-colors',
                          status === 'answered'
                            ? 'btn-primary gap-2'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'
                        )}
                      >
                        {status === 'answered' && <Send className="h-4 w-4" />}
                        {t(`appeals.set_${status}`)}
                      </button>
                    ))}
                    <button
                      onClick={() => updateMut.mutate({ id: appeal.id, values: { answerNote: noteDraft } })}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      {t('appeals.save_note')}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(appeal.id);
                      }}
                      className="btn-secondary gap-2 text-sm px-4 py-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" /> {t('admin.delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
