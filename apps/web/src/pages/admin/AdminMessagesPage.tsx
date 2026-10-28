import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Trash2, Mail, Phone, Send, Search, X, ArrowLeft, Copy, Check, Inbox, Eye, Lock, RotateCcw,
  StickyNote, Reply, MessageSquareText, Clock, MailCheck, MailWarning, type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { contactApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdminFormModal from '@/components/admin/AdminFormModal';
import { useToast } from '@/components/Toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDateTime, formatRelative } from '@/lib/date';

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

interface ListResponse {
  data: Appeal[];
  page: number;
  totalPages: number;
  total: number;
  unanswered: number;
  counts: Record<AppealStatus, number>;
}

const STATUSES: AppealStatus[] = ['new', 'in_review', 'answered', 'closed'];

/** Har bir holat uchun rang va ikonka — ro'yxat, tablar va bosqichlarda bir xil. */
const STATUS_META: Record<AppealStatus, { icon: LucideIcon; badge: string; dot: string; tab: string }> = {
  new: {
    icon: Inbox,
    badge: 'bg-primary-50 text-primary-800 ring-primary-200 dark:bg-primary-900/40 dark:text-primary-200 dark:ring-primary-800',
    dot: 'bg-primary-600',
    tab: 'from-primary-600 to-primary-800',
  },
  in_review: {
    icon: Eye,
    badge: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800',
    dot: 'bg-amber-500',
    tab: 'from-amber-500 to-orange-600',
  },
  answered: {
    icon: MailCheck,
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800',
    dot: 'bg-emerald-500',
    tab: 'from-emerald-500 to-teal-700',
  },
  closed: {
    icon: Lock,
    badge: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
    dot: 'bg-gray-500',
    tab: 'from-gray-500 to-gray-700',
  },
};

/** Keyingi tabiiy qadam — asosiy tugma shunga bag'ishlanadi. */
const NEXT_STATUS: Record<AppealStatus, AppealStatus> = {
  new: 'in_review', in_review: 'answered', answered: 'closed', closed: 'in_review',
};

const AVATAR_COLORS = [
  'from-sky-500 to-blue-700', 'from-violet-500 to-purple-700', 'from-rose-500 to-pink-700',
  'from-emerald-500 to-teal-700', 'from-amber-500 to-orange-700', 'from-cyan-500 to-sky-700',
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm',
        avatarColor(name),
        size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
      )}
    >
      {initials(name)}
    </span>
  );
}

function StatusBadge({ status }: { status: AppealStatus }) {
  const { t } = useTranslation();
  const Icon = STATUS_META[status].icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', STATUS_META[status].badge)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`appeal.status_${status}`)}
    </span>
  );
}

/** Tasdiqlash oynasi — brauzerning `confirm()` i o'rniga. */
type Pending = { kind: 'answered'; appeal: Appeal } | { kind: 'delete'; appeal: Appeal };

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<AppealStatus | ''>('');
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const q = useDebouncedValue(search.trim(), 300);
  const query = q.length >= 2 ? q : '';
  const selectedId = params.get('id');

  const list = useInfiniteQuery({
    queryKey: ['admin-messages', filter, query],
    queryFn: ({ pageParam }) => contactApi.list(pageParam, filter, query).then((r) => r.data as ListResponse),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

  const appeals = useMemo(() => list.data?.pages.flatMap((p) => p.data) ?? [], [list.data]);
  const first = list.data?.pages[0];
  const counts = first?.counts;
  const total = first?.total ?? 0;
  const allCount = counts ? STATUSES.reduce((sum, s) => sum + counts[s], 0) : 0;
  const selected = appeals.find((a) => a.id === selectedId) ?? null;

  const select = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('id', id); else next.delete('id');
    setParams(next, { replace: true });
  };

  // J/K yoki ↑/↓ — ro'yxat bo'ylab yurish (yozish maydonida emas).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (pending || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return;
      const dir = e.key === 'j' || e.key === 'ArrowDown' ? 1 : e.key === 'k' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir || appeals.length === 0) return;
      e.preventDefault();
      const index = appeals.findIndex((a) => a.id === selectedId);
      const next = appeals[Math.min(appeals.length - 1, Math.max(0, index + dir))];
      select(next.id);
      document.getElementById(`appeal-${next.id}`)?.scrollIntoView({ block: 'nearest' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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
    onSuccess: () => { refresh(); select(null); setPending(null); toast.success(t('toast.saved')); },
    onError: (error) => toast.showError(error),
  });

  /**
   * `answered` holatiga o'tkazish fuqaroga XAT YUBORADI, shuning uchun
   * tasdiq so'raladi — tasodifan bosib qo'yish natijasida noto'g'ri xat
   * ketmasligi kerak (09-topshiriq, 6-bo'lim).
   */
  const changeStatus = (appeal: Appeal, status: AppealStatus) => {
    if (status === 'answered') { setPending({ kind: 'answered', appeal }); return; }
    updateMut.mutate({ id: appeal.id, values: { status } });
  };

  const tabs: { value: AppealStatus | ''; count: number }[] = [
    { value: '', count: allCount },
    ...STATUSES.map((s) => ({ value: s, count: counts?.[s] ?? 0 })),
  ];

  return (
    <>
      <Helmet><title>{t('admin.messages')} | Admin</title></Helmet>
      <div className="flex h-full flex-col">
        {/* Sarlavha va holat tablari */}
        <div className="shrink-0 border-b border-gray-200 bg-white px-4 pt-5 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-900/20">
                <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.messages')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('appeals.subtitle')}</p>
              </div>
            </div>
            {first && first.unanswered > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 ring-1 ring-inset ring-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:ring-orange-800">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-600" />
                </span>
                {t('appeals.unanswered')}: {first.unanswered}
              </div>
            )}
          </div>

          <div role="tablist" aria-label={t('appeals.filter')} className="-mb-px mt-5 flex gap-1 overflow-x-auto">
            {tabs.map(({ value, count }) => {
              const active = filter === value;
              return (
                <button
                  key={value || 'all'}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setFilter(value); select(null); }}
                  className={clsx(
                    'flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary-700 text-primary-800 dark:border-primary-400 dark:text-primary-200'
                      : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  )}
                >
                  {value && <span className={clsx('h-2 w-2 rounded-full', STATUS_META[value].dot)} aria-hidden="true" />}
                  {value ? t(`appeal.status_${value}`) : t('appeals.all')}
                  <span className={clsx(
                    'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                    active ? 'bg-primary-700 text-white dark:bg-primary-500' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Ro'yxat */}
          <section
            aria-label={t('admin.messages')}
            className={clsx(
              'min-h-0 w-full flex-col border-r border-gray-200 bg-white lg:flex lg:w-[400px] lg:shrink-0 dark:border-gray-800 dark:bg-gray-900',
              selected ? 'hidden' : 'flex'
            )}
          >
            <div className="shrink-0 border-b border-gray-100 p-3 dark:border-gray-800">
              <label htmlFor="appeal-search" className="sr-only">{t('appeals.search_label')}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  id="appeal-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('appeals.search_placeholder')}
                  className="input pl-9 pr-9"
                  maxLength={100}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label={t('common.close')}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p aria-live="polite" className="mt-2 px-1 text-xs text-gray-600 dark:text-gray-400">
                {list.isFetching && !list.isFetchingNextPage ? t('common.loading') : t('appeals.results', { count: total })}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {list.isLoading && <LoadingSpinner />}
              {list.isError && <p className="p-6 text-center text-sm text-red-700 dark:text-red-400">{t('common.error')}</p>}
              {!list.isLoading && !list.isError && appeals.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
                    <Inbox className="h-6 w-6 text-primary-700 dark:text-primary-300" aria-hidden="true" />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{t('appeals.empty')}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('appeals.empty_hint')}</p>
                </div>
              )}

              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {appeals.map((appeal) => {
                  const active = appeal.id === selectedId;
                  const unread = appeal.status === 'new';
                  return (
                    <li key={appeal.id}>
                      <button
                        id={`appeal-${appeal.id}`}
                        onClick={() => select(appeal.id)}
                        aria-current={active ? 'true' : undefined}
                        className={clsx(
                          'relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
                          active ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        )}
                      >
                        {active && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary-700 dark:bg-primary-400" />}
                        <Avatar name={appeal.name} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={clsx('truncate text-sm', unread ? 'font-semibold text-gray-900 dark:text-gray-50' : 'font-medium text-gray-800 dark:text-gray-200')}>
                              {appeal.name}
                            </span>
                            <time dateTime={appeal.createdAt} title={formatDateTime(appeal.createdAt)} className="shrink-0 text-xs text-gray-600 dark:text-gray-400">
                              {formatRelative(appeal.createdAt)}
                            </time>
                          </div>
                          <p className={clsx('truncate text-sm', unread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300')}>
                            {appeal.subject}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-600 dark:text-gray-400">{appeal.message}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={appeal.status} />
                            <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400">{appeal.ticketNumber}</span>
                            {!appeal.notifiedAt && (
                              <MailWarning className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" aria-label={t('appeals.not_notified')} />
                            )}
                          </div>
                        </div>
                        {unread && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {list.hasNextPage && (
                <div className="p-3">
                  <button
                    onClick={() => list.fetchNextPage()}
                    disabled={list.isFetchingNextPage}
                    className="btn-secondary w-full text-sm"
                  >
                    {list.isFetchingNextPage ? t('common.loading') : t('appeals.load_more')}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Tafsilot */}
          <section
            aria-label={t('appeals.detail')}
            className={clsx('min-h-0 flex-1 overflow-y-auto bg-gray-50 lg:block dark:bg-gray-950', selected ? 'block' : 'hidden')}
          >
            {selected ? (
              <AppealDetail
                key={selected.id}
                appeal={selected}
                busy={updateMut.isPending}
                onBack={() => select(null)}
                onStatus={(status) => changeStatus(selected, status)}
                onSaveNote={(answerNote) => updateMut.mutate({ id: selected.id, values: { answerNote } })}
                onDelete={() => setPending({ kind: 'delete', appeal: selected })}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                <div className="relative mb-6">
                  <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-primary-400/20 blur-2xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 text-white shadow-xl shadow-primary-900/25">
                    <Mail className="h-9 w-9" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('appeals.select_title')}</p>
                <p className="mt-1 max-w-sm text-sm text-gray-600 dark:text-gray-400">{t('appeals.select_hint')}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400" aria-hidden="true">
                  {['J', 'K', '↑', '↓'].map((key) => (
                    <kbd key={key} className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 font-mono shadow-sm dark:border-gray-700 dark:bg-gray-900">{key}</kbd>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {pending?.kind === 'answered' && (
        <AdminFormModal
          title={t('appeals.confirm_answered_title')}
          icon={Send}
          onClose={() => setPending(null)}
          footer={(
            <>
              <button onClick={() => setPending(null)} className="btn-secondary">{t('admin.cancel')}</button>
              <button
                onClick={() => {
                  updateMut.mutate({ id: pending.appeal.id, values: { status: 'answered' } });
                  setPending(null);
                }}
                className="btn-primary gap-2"
              >
                <Send className="h-4 w-4" aria-hidden="true" /> {t('appeals.confirm_send')}
              </button>
            </>
          )}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">{t('appeals.confirm_answered')}</p>
          <p className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Mail className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span className="truncate">{pending.appeal.email}</span>
          </p>
        </AdminFormModal>
      )}

      {pending?.kind === 'delete' && (
        <AdminFormModal
          title={t('appeals.confirm_delete_title')}
          icon={Trash2}
          onClose={() => setPending(null)}
          footer={(
            <>
              <button onClick={() => setPending(null)} className="btn-secondary">{t('admin.cancel')}</button>
              <button
                onClick={() => deleteMut.mutate(pending.appeal.id)}
                disabled={deleteMut.isPending}
                className="btn-danger gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> {t('admin.delete')}
              </button>
            </>
          )}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('appeals.confirm_delete_text', { ticket: pending.appeal.ticketNumber })}
          </p>
        </AdminFormModal>
      )}
    </>
  );
}

interface DetailProps {
  appeal: Appeal;
  busy: boolean;
  onBack: () => void;
  onStatus: (status: AppealStatus) => void;
  onSaveNote: (note: string) => void;
  onDelete: () => void;
}

function AppealDetail({ appeal, busy, onBack, onStatus, onSaveNote, onDelete }: DetailProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [note, setNote] = useState(appeal.answerNote ?? '');
  const [copied, setCopied] = useState<string | null>(null);
  const noteDirty = note !== (appeal.answerNote ?? '');
  const next = NEXT_STATUS[appeal.status];
  const NextIcon = appeal.status === 'closed' ? RotateCcw : next === 'answered' ? Send : STATUS_META[next].icon;
  const others = STATUSES.filter((s) => s !== appeal.status && s !== next);
  const replyHref = `mailto:${appeal.email}?subject=${encodeURIComponent(`Re: ${appeal.ticketNumber} — ${appeal.subject}`)}`;

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(t('appeals.copied'));
      window.setTimeout(() => setCopied(null), 1500);
    } catch (error) {
      toast.showError(error);
    }
  };

  // Bosqichlar: qaysi sanada qaysi holatga o'tilgani ma'lum bo'lgancha ko'rsatiladi.
  const currentIndex = STATUSES.indexOf(appeal.status);
  const stepDate = (status: AppealStatus): string | null => {
    if (status === 'new') return appeal.createdAt;
    if (status === appeal.status) return appeal.statusChangedAt;
    if (status === 'answered' && appeal.answeredAt) return appeal.answeredAt;
    return null;
  };

  return (
    <article className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 motion-safe:animate-fade-in">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline lg:hidden dark:text-primary-300">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('appeals.back_to_list')}
      </button>

      {/* Bosh qism */}
      <div className="card">
        <div aria-hidden="true" className={clsx('h-1.5 bg-gradient-to-r', STATUS_META[appeal.status].tab)} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={appeal.status} />
            <button
              onClick={() => copy(appeal.ticketNumber, 'ticket')}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={`${t('appeals.copy_ticket')}: ${appeal.ticketNumber}`}
            >
              {appeal.ticketNumber}
              {copied === 'ticket' ? <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
            </button>
            <span className={clsx(
              'inline-flex items-center gap-1 text-xs',
              appeal.notifiedAt ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
            )} title={appeal.notifiedAt ? undefined : t('appeals.not_notified_hint')}>
              {appeal.notifiedAt
                ? <><MailCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('appeals.notified')}</>
                : <><MailWarning className="h-3.5 w-3.5" aria-hidden="true" /> {t('appeals.not_notified')}</>}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-50">{appeal.subject}</h2>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Avatar name={appeal.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{appeal.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <a href={`mailto:${appeal.email}`} className="inline-flex items-center gap-1.5 text-primary-700 hover:underline dark:text-primary-300">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {appeal.email}
                  </a>
                  <button
                    onClick={() => copy(appeal.email, 'email')}
                    aria-label={t('appeals.copy_email')}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  >
                    {copied === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                </span>
                {appeal.phone && (
                  <a href={`tel:${appeal.phone}`} className="inline-flex items-center gap-1.5 text-gray-700 hover:underline dark:text-gray-300">
                    <Phone className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" /> {appeal.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-gray-600 dark:text-gray-400">
              <p className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatRelative(appeal.createdAt)}</p>
              <p className="mt-0.5">{formatDateTime(appeal.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Bosqichlar */}
        <div className="border-t border-gray-100 px-5 py-5 sm:px-6 dark:border-gray-800">
          <h3 className="sr-only">{t('appeals.progress')}</h3>
          <ol className="grid grid-cols-4 gap-2">
            {STATUSES.map((status, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              const date = stepDate(status);
              const Icon = STATUS_META[status].icon;
              return (
                <li key={status} className="relative flex flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
                  {i > 0 && (
                    <span aria-hidden="true" className={clsx(
                      'absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                      i <= currentIndex ? 'bg-primary-600 dark:bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'
                    )} />
                  )}
                  <span className={clsx(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white transition-colors dark:ring-gray-900',
                    current && clsx('bg-gradient-to-br text-white shadow-md', STATUS_META[status].tab),
                    done && 'bg-primary-700 text-white dark:bg-primary-500',
                    !done && !current && 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className={clsx(
                    'mt-2 text-xs',
                    current ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {t(`appeal.status_${status}`)}
                  </span>
                  {date && <span className="text-[11px] text-gray-600 dark:text-gray-400">{formatDateTime(date)}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Murojaat matni */}
      <div className="card mt-5 p-5 sm:p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <MessageSquareText className="h-4 w-4 text-gray-500" aria-hidden="true" /> {t('appeals.message')}
        </h3>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">{appeal.message}</p>
      </div>

      {/* Ichki izoh */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 dark:border-amber-900/60 dark:bg-amber-950/20">
        <label htmlFor="appeal-note" className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <StickyNote className="h-4 w-4" aria-hidden="true" /> {t('appeals.note')}
        </label>
        <textarea
          id="appeal-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="input resize-y bg-white dark:bg-gray-900"
          placeholder={t('appeals.note_placeholder')}
          aria-describedby="appeal-note-hint"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p id="appeal-note-hint" className="inline-flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock className="h-3 w-3" aria-hidden="true" /> {t('appeals.note_hint')}
          </p>
          <button
            onClick={() => onSaveNote(note)}
            disabled={!noteDirty || busy}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            {t('appeals.save_note')}
          </button>
        </div>
      </div>

      {/* Amallar */}
      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-gray-200 bg-gray-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-gray-800 dark:bg-gray-950/90">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onStatus(next)} disabled={busy} className="btn-primary gap-2 shadow-lg shadow-primary-900/20">
            <NextIcon className="h-4 w-4" aria-hidden="true" />
            {appeal.status === 'closed' ? t('appeals.reopen') : t(`appeals.set_${next}`)}
          </button>
          <a href={replyHref} className="btn-secondary gap-2">
            <Reply className="h-4 w-4" aria-hidden="true" /> {t('appeals.reply')}
          </a>
          {others.length > 0 && (
            <>
              <label htmlFor="appeal-other-status" className="sr-only">{t('appeals.other_status')}</label>
              <select
                id="appeal-other-status"
                value=""
                disabled={busy}
                onChange={(e) => { if (e.target.value) onStatus(e.target.value as AppealStatus); }}
                className="input w-auto"
              >
                <option value="">{t('appeals.other_status')}</option>
                {others.map((s) => <option key={s} value={s}>{t(`appeals.set_${s}`)}</option>)}
              </select>
            </>
          )}
          <button
            onClick={onDelete}
            aria-label={t('admin.delete')}
            title={t('admin.delete')}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
