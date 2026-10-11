// src/components/dashboard/widgets/RegionChartWidget.tsx
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { PROJECTS_DATA } from '@/data/projects-data';
import { ALL_REGIONS } from '@/data/regions-data';

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        background: 'rgba(5,13,26,0.95)',
        border: '1px solid rgba(0,230,200,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? formatUSD(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function RegionChartWidget() {
  const { t } = useTranslation();

  const regionChartData = useMemo(() => {
    return ALL_REGIONS
      .filter((r) => r.id !== 'global')
      .map((r) => ({
        name: r.name_ru,
        investment: PROJECTS_DATA
          .filter((p) => r.countries.includes(p.country))
          .reduce((s, p) => s + (p.budget ?? 0), 0),
      }))
      .filter((d) => d.investment > 0)
      .sort((a, b) => b.investment - a.investment);
  }, []);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={regionChartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            angle={-20}
            textAnchor="end"
            height={45}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatUSD(v)}
          />
          <Tooltip content={<DarkTooltip />} />
          <Bar
            dataKey="investment"
            name={t('dashboard.bar_investments')}
            fill="#00e6c8"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
