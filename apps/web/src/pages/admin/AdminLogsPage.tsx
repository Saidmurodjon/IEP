import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Check, Trash2, Server, Monitor, Trash } from 'lucide-react';
import clsx from 'clsx';
import { logsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { formatDateTime } from '@/lib/date';

interface LogRow {
  id: string;
  fingerprint: string;
  source: 'server' | 'client';
  level: 'error' | 'warning' | 'info';
  code?: string | null;
  message: string;
  path?: string | null;
  method?: string | null;
  statusCode?: number | null;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  isResolved: boolean;
  stack?: string | null;
  userAgent?: string | null;
  note?: string | null;
}

const LEVEL_STYLE: Record<string, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
};

export default function AdminLogsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();

  const [filters, setFilters] = useState({ source: '', level: '', resolved: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', filters, page],
    queryFn: () => logsApi.list({ ...filters, page, limit: 25 }),
  });

  const rows: LogRow[] = data?.data?.data ?? [];
  const totalPages: number = data?.data?.totalPages ?? 1;

  const { data: detail } = useQuery({
    queryKey: ['admin-log', openId],
    queryFn: () => logsApi.get(openId as string),
    enabled: !!openId,
  });
  const full: LogRow | undefined = detail?.data?.data;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-logs'] });
    qc.invalidateQueries({ queryKey: ['admin-log'] });
    qc.invalidateQueries({ queryKey: ['admin-logs-badge'] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { isResolved?: boolean; note?: string } }) =>
      logsApi.update(id, values),
    onSuccess: () => { refresh(); toast.success(t('toast.saved')); },
    onError: (error) => toast.showError(error),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => logsApi.delete(id),
    onSuccess: () => { refresh(); setOpenId(null); toast.success(t('toast.saved')); },
    onError: (error) => toast.showError(error),
  });
  const cleanupMutation = useMutation({
    mutationFn: () => logsApi.cleanup(),
    onSuccess: (response) => {
      refresh();
      toast.success(t('logs.cleaned', { count: response.data.data.deleted }));
    },
    onError: (error) => toast.showError(error),
  });

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const toggleRow = (row: LogRow) => {
    const next = openId === row.id ? null : row.id;
    setOpenId(next);
    setNoteDraft(next ? (row.note ?? '') : '');
  };

  return (
    <>
      <Helmet><title>{t('admin.logs')} | Admin</title></Helmet>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.logs')}</h1>
          <button
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
            className="btn-secondary gap-2 text-sm"
          >
            <Trash className="h-4 w-4" />
            {t('logs.cleanup')}
          </button>
        </div>

        {/* Filtrlar */}
        <div className="card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">{t('logs.source')}</label>
            <select value={filters.source} onChange={(e) => setFilter('source', e.target.value)} className="input">
              <option value="">{t('logs.all')}</option>
              <option value="server">{t('logs.server')}</option>
              <option value="client">{t('logs.client')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('logs.level')}</label>
            <select value={filters.level} onChange={(e) => setFilter('level', e.target.value)} className="input">
              <option value="">{t('logs.all')}</option>
              <option value="error">{t('logs.level_error')}</option>
              <option value="warning">{t('logs.level_warning')}</option>
              <option value="info">{t('logs.level_info')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('logs.status')}</label>
            <select value={filters.resolved} onChange={(e) => setFilter('resolved', e.target.value)} className="input">
              <option value="">{t('logs.all')}</option>
              <option value="false">{t('logs.unresolved')}</option>
              <option value="true">{t('logs.resolved')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('logs.from')}</label>
            <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t('logs.to')}</label>
            <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className="input" />
          </div>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && rows.length === 0 && (
          <EmptyState icon={Server} title={t('logs.empty')} hint={t('logs.empty_hint')} />
        )}

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className={clsx('card', row.isResolved && 'opacity-60')}>
              <button
                onClick={() => toggleRow(row)}
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                {openId === row.id ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium border', LEVEL_STYLE[row.level])}>
                      {t(`logs.level_${row.level}`)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      {row.source === 'server' ? <Server className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                      {t(`logs.${row.source}`)}
                    </span>
                    {row.code && <span className="text-xs font-mono text-gray-400">{row.code}</span>}
                    {row.isResolved && (
                      <span className="text-xs text-emerald-600 font-medium">{t('logs.resolved')}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 break-words">{row.message}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                    {row.path && <span className="font-mono">{row.method} {row.path}</span>}
                    <span>{t('logs.first_seen')}: {formatDateTime(row.firstSeenAt)}</span>
                    <span>{t('logs.last_seen')}: {formatDateTime(row.lastSeenAt)}</span>
                  </div>
                </div>

                <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  ×{row.count}
                </span>
              </button>

              {openId === row.id && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/60">
                  {full?.stack && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">{t('logs.stack')}</div>
                      <pre className="text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words text-gray-700">
                        {full.stack}
                      </pre>
                    </div>
                  )}
                  {full?.userAgent && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">User-Agent:</span> {full.userAgent}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 font-mono">fingerprint: {row.fingerprint}</div>

                  <div>
                    <label className="label">{t('logs.note')}</label>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      rows={2}
                      className="input resize-none"
                      placeholder={t('logs.note_placeholder')}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateMutation.mutate({ id: row.id, values: { isResolved: !row.isResolved, note: noteDraft } })
                      }
                      className="btn-primary gap-2 text-sm px-4 py-2"
                    >
                      <Check className="h-4 w-4" />
                      {t(row.isResolved ? 'logs.mark_unresolved' : 'logs.mark_resolved')}
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: row.id, values: { note: noteDraft } })}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      {t('logs.save_note')}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(row.id);
                      }}
                      className="btn-secondary gap-2 text-sm px-4 py-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 disabled:opacity-40">
              ‹
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2 disabled:opacity-40">
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}
