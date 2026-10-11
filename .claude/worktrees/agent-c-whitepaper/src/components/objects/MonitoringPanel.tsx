// src/components/objects/MonitoringPanel.tsx
import { useObjectMonitoring } from '@/hooks/useObjectMonitoring';
import { WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const PARAM_LABELS: Record<string, { label: string; color: string }> = {
  flow_m3s:     { label: 'Расход',               color: '#00e6c8' },
  level_m:      { label: 'Уровень',              color: '#3b82f6' },
  ph:           { label: 'pH',                   color: '#a78bfa' },
  temperature:  { label: 'Температура',          color: '#f59e0b' },
  turbidity:    { label: 'Мутность',             color: '#94a3b8' },
  conductivity: { label: 'Электропроводность',   color: '#22d3ee' },
};

export function MonitoringPanel({ objectId }: { objectId: string }) {
  const { data: readings, isLoading, latest } = useObjectMonitoring(objectId);

  if (isLoading) return (
    <div className="h-48 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  if (!readings?.length) return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
      <WifiOff size={24} className="text-white/20 mx-auto mb-2" />
      <p className="text-sm text-white/40">Данные мониторинга не подключены</p>
      <p className="text-xs text-white/20 mt-1">IoT-сенсор или API ещё не настроен для этого объекта</p>
    </div>
  );

  // Group by parameter for last reading
  const latestByParam = readings.reduce((acc, r) => {
    if (!acc[r.parameter] || new Date(r.timestamp) > new Date(acc[r.parameter].timestamp)) {
      acc[r.parameter] = r;
    }
    return acc;
  }, {} as Record<string, typeof readings[0]>);

  // Chart data for main parameter (flow or level)
  const mainParam = Object.keys(latestByParam)[0];
  const chartData = readings
    .filter(r => r.parameter === mainParam)
    .slice(0, 48)
    .reverse()
    .map(r => ({ time: format(new Date(r.timestamp), 'HH:mm'), value: r.value }));

  const cfg = PARAM_LABELS[mainParam] ?? { label: mainParam, color: '#00e6c8' };

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-400">Данные в реальном времени</span>
        {latest && <span className="text-xs text-white/30 ml-auto">Обновлено только что</span>}
      </div>

      {/* Current readings */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(latestByParam).slice(0, 4).map(([param, reading]) => {
          const p = PARAM_LABELS[param] ?? { label: param, color: '#94a3b8' };
          return (
            <div key={param} className="p-3 rounded-xl bg-white/5 border border-white/[0.08]">
              <p className="text-[10px] text-white/40">{p.label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: p.color }}>
                {reading.value.toFixed(2)}
                <span className="text-xs font-normal text-white/40 ml-1">{reading.unit}</span>
              </p>
              <p className="text-[10px] text-white/30 mt-1">{reading.source_api?.toUpperCase() ?? 'Сенсор'}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 2 && (
        <div className="h-32">
          <p className="text-xs text-white/30 mb-2">{cfg.label} — последние 48 часов</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="monGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} interval={11} />
              <Tooltip contentStyle={{ background: '#050d1a', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={1.5} fill="url(#monGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
