import { useTranslation } from 'react-i18next';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useResolvedAdminTheme } from '@/store/adminPrefs';

export interface BarDatum { label: string; value: number }

interface BarCardProps {
  title: string;
  data: BarDatum[];
  /** Gorizontal ustunlar (uzun yorliqlar uchun) */
  horizontal?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** Sarlavha yonidagi qisqa izoh (masalan, «joriy holat»). */
  note?: string;
}

// Yagona qator — barcha diagrammalarda bitta rang.
const BAR_COLOR = '#2f6db0';
// Mavzuga qarab ranglar. Ustun rangi #2f6db0 qorong'i fonda (gray-900) 3,32:1 — 3:1 dan yuqori, o'zgarmaydi.
const CHART_COLORS = {
  light: { grid: '#e5e7eb', tick: '#4b5563', tipBg: '#ffffff', tipBorder: '#e5e7eb', tipText: '#111827', cursor: 'rgba(47,109,176,0.08)' },
  dark: { grid: '#374151', tick: '#9ca3af', tipBg: '#1f2937', tipBorder: '#374151', tipText: '#f3f4f6', cursor: 'rgba(107,155,209,0.15)' },
} as const;

/** Qayta ishlatiladigan ustunli diagramma kartochkasi (vertikal/gorizontal). */
export default function BarCard({ title, data, horizontal = false, loading, error, onRetry, note }: BarCardProps) {
  const { t } = useTranslation();
  const theme = useResolvedAdminTheme();
  const c = CHART_COLORS[theme];
  const TICK = { fill: c.tick, fontSize: 12 };
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const empty = total === 0;
  const ariaLabel = `${title}: ${t('admin.dashboardStats.total')} ${total}`;

  let body: React.ReactNode;
  if (loading) {
    body = <div className="h-[240px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" aria-hidden="true" />;
  } else if (error) {
    body = (
      <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-300" role="alert">
        <p>{t('admin.dashboardStats.error')}</p>
        <button type="button" onClick={onRetry} className="btn-secondary">
          {t('admin.dashboardStats.retry')}
        </button>
      </div>
    );
  } else if (empty) {
    body = (
      <div className="h-[240px] flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        {t('admin.dashboardStats.noData')}
      </div>
    );
  } else {
    body = (
      <div role="img" aria-label={ariaLabel}>
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              layout={horizontal ? 'vertical' : 'horizontal'}
              barGap={2}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                stroke={c.grid}
                vertical={horizontal}
                horizontal={!horizontal}
              />
              {horizontal ? (
                <>
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={TICK} />
                  <YAxis type="category" dataKey="label" width={130} axisLine={false} tickLine={false} tick={TICK} />
                </>
              ) : (
                <>
                  {/* Ko'p ustunda (kunlik) har yorliq sig'maydi — recharts o'zi siyraklashtiradi. */}
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK} interval={data.length > 14 ? 'preserveStartEnd' : 0} minTickGap={8} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={TICK} width={32} />
                </>
              )}
              <Tooltip
                cursor={{ fill: c.cursor }}
                contentStyle={{ borderRadius: 8, border: `1px solid ${c.tipBorder}`, background: c.tipBg, fontSize: 12 }}
                labelStyle={{ color: c.tipText }}
                itemStyle={{ color: c.tipText }}
              />
              <Bar
                dataKey="value"
                name={title}
                fill={BAR_COLOR}
                maxBarSize={28}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{t('admin.dashboardStats.category')}</th>
              <th scope="col">{t('admin.dashboardStats.value')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.label}-${i}`}>
                <th scope="row">{d.label}</th>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="card p-5">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
        {note && <span className="ml-2 text-xs font-normal text-gray-600 dark:text-gray-400">({note})</span>}
      </h2>
      {body}
    </section>
  );
}
