import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/date';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Trash2, Upload, ExternalLink } from 'lucide-react';
import { fileUrl, parseStructureChart, settingsApi, structureApi, uploadsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';

const ACCEPT = 'image/jpeg,image/png,image/webp';

/** Tasdiqlangan tuzilma hujjatini yuklash, almashtirish va olib tashlash kartasi. */
export default function StructureChartCard() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.all() });
  const chart = parseStructureChart((data?.data?.data as Record<string, string> | undefined)?.structureChart);

  const refresh = () => qc.invalidateQueries({ queryKey: ['settings'] });

  const removeMut = useMutation({
    mutationFn: () => structureApi.setChart(null),
    onSuccess: () => { refresh(); toast.success(t('admin_chart.removed')); },
    onError: (e) => toast.showError(e),
  });

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const res = await uploadsApi.upload(file, 'chart');
      await structureApi.setChart(res.data.data.url);
      await refresh();
      toast.success(t('admin_chart.saved'));
    } catch (e) {
      toast.showError(e);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const dateText = chart && !Number.isNaN(new Date(chart.updatedAt).getTime()) ? formatDate(chart.updatedAt) : '';

  return (
    <section aria-labelledby="chart-card-title" className="card p-5 mb-6">
      <h2 id="chart-card-title" className="font-semibold text-gray-900">{t('admin_chart.title')}</h2>
      <p id="chart-card-hint" className="text-sm text-gray-600 mt-1 mb-4">{t('admin_chart.hint')}</p>

      <div aria-live="polite" className="mb-4">
        {chart ? (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{chart.name}</p>
              <p className="text-xs text-gray-600">
                {chart.mime}{dateText && ` · ${t('admin_chart.updated', { date: dateText })}`}
              </p>
            </div>
            <a
              href={fileUrl(chart.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {t('admin_chart.open')}
              <span className="sr-only"> {t('a11y.new_tab')}</span>
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{t('admin_chart.none')}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || removeMut.isPending}
          className="btn-primary gap-2"
        >
          {busy
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            : <Upload className="h-4 w-4" aria-hidden="true" />}
          {busy ? t('admin_chart.uploading') : chart ? t('admin_chart.replace') : t('admin_chart.upload')}
        </button>
        {chart && (
          <button
            type="button"
            onClick={() => { if (window.confirm(t('admin_chart.remove_confirm'))) removeMut.mutate(); }}
            disabled={busy || removeMut.isPending}
            className="btn-secondary gap-2 text-red-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t('admin_chart.remove')}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        tabIndex={-1}
        aria-label={t('admin_chart.file_label')}
        aria-describedby="chart-card-hint"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
    </section>
  );
}
