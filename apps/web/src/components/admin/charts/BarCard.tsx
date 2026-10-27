import { useTranslation } from 'react-i18next';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export interface BarDatum { label: string; value: number }

interface BarCardProps {
  title: string;
  data: BarDatum[];
  /** Gorizontal ustunlar (uzun yorliqlar uchun) */
  horizontal?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

// Yagona qator — barcha diagrammalarda bitta rang.
const BAR_COLOR = '#2f6db0';
const GRID_COLOR = '#e5e7eb';
const TICK = { fill: '#4b5563', fontSize: 12 };

/** Qayta ishlatiladigan ustunli diagramma kartochkasi (vertikal/gorizontal). */
export default function BarCard({ title, data, horizontal = false, loading, error, onRetry }: BarCardProps) {
  const { t } = useTranslation();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const empty = total === 0;
  const ariaLabel = `${title}: ${t('admin.dashboardStats.total')} ${total}`;

  let body: React.ReactNode;
  if (loading) {
    body = <div className="h-[240px] rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />;
  } else if (error) {
    body = (
      <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-sm text-gray-700" role="alert">
        <p>{t('admin.dashboardStats.error')}</p>
        <button type="button" onClick={onRetry} className="btn-secondary">
          {t('admin.dashboardStats.retry')}
        </button>
      </div>
    );
  } else if (empty) {
    body = (
      <div className="h-[240px] flex items-center justify-center text-sm text-gray-600">
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
                stroke={GRID_COLOR}
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
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK} interval={0} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={TICK} width={32} />
                </>
              )}
              <Tooltip
                cursor={{ fill: 'rgba(47,109,176,0.08)' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
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
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {body}
    </section>
  );
}
