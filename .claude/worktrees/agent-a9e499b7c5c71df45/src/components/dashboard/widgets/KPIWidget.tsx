// src/components/dashboard/widgets/KPIWidget.tsx
import { TrendingUp, Droplets, Globe2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardStats } from '@/hooks/useDashboardStats';

type MetricKey = 'objects' | 'projects' | 'portfolio' | 'capacity';

interface MetricCfg {
  icon: React.ElementType;
  color: string;
  labelKey: string;
  spark: number[];
  getValue: (stats: ReturnType<typeof useDashboardStats>['data']) => number;
  format: (v: number) => string;
}

const METRICS: Record<MetricKey, MetricCfg> = {
  objects: {
    icon: Globe2, color: '#00e6c8',
    labelKey: 'dashboard.kpi_objects',
    spark: [320, 360, 390, 420, 445, 460, 470, 473],
    getValue: (s) => s?.objectsCount ?? 0,
    format: (v) => String(v),
  },
  projects: {
    icon: Zap, color: '#a78bfa',
    labelKey: 'dashboard.kpi_projects',
    spark: [80, 95, 110, 120, 128, 134, 138, 139],
    getValue: (s) => s?.projectsCount ?? 0,
    format: (v) => String(v),
  },
  portfolio: {
    icon: TrendingUp, color: '#f59e0b',
    labelKey: 'dashboard.kpi_portfolio',
    spark: [100, 200, 350, 500, 700, 900, 1100, 1400],
    getValue: (s) => s?.portfolioTotal ?? 0,
    format: (v) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`,
  },
  capacity: {
    icon: Droplets, color: '#22d3ee',
    labelKey: 'dashboard.kpi_capacity',
    spark: [50, 80, 120, 160, 200, 280, 350, 480],
    getValue: (s) => s?.capacityTotal ?? 0,
    format: (v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B м³/сут` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M м³/сут` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K м³/сут` : `${v} м³/сут`,
  },
};

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pts = points
    .map((v, i) => `${(i / (points.length - 1)) * 80},${20 - ((v - min) / range) * 18}`)
    .join(' ');
  return (
    <svg width={80} height={22} className="mt-2 opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KPIWidget({ metric = 'objects' }: { metric?: MetricKey }) {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useDashboardStats();
  const cfg = METRICS[metric] ?? METRICS.objects;
  const Icon = cfg.icon;
  const value = cfg.getValue(stats);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 mb-1">{t(cfg.labelKey)}</p>
          {isLoading ? (
            <div className="h-7 w-16 rounded bg-white/10 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white">{cfg.format(value)}</p>
          )}
        </div>
        <div className="p-2 rounded-xl" style={{ background: `${cfg.color}18` }}>
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
      </div>
      <Sparkline points={cfg.spark} color={cfg.color} />
    </div>
  );
}
